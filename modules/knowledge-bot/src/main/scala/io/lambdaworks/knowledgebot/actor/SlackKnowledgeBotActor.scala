package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.receptionist.ServiceKey
import akka.actor.typed.scaladsl.{Behaviors, StashBuffer}
import akka.actor.typed.{ActorRef, Behavior}
import akka.actor.{ActorSystem, Scheduler}
import io.lambdaworks.knowledgebot.Main
import io.lambdaworks.knowledgebot.actor.SlackKnowledgeBotActor._
import io.lambdaworks.knowledgebot.actor.model.{Interaction, SlackMessageId}
import io.lambdaworks.knowledgebot.retrieval.openai.GPTRetriever
import io.lambdaworks.langchain.schema.document.Document
import me.shadaj.scalapy.py
import slack.rtm.SlackRtmClient

import scala.concurrent.ExecutionContextExecutor
import scala.concurrent.duration.DurationInt
import scala.util.Success

object SlackKnowledgeBotActor {
  sealed trait Event

  final case class NewToken(token: String)                    extends Event
  final case object MessageUpdated                            extends Event
  final case class LLMResponse(response: Map[String, py.Any]) extends Event
  final case class SentResponse(response: String)             extends Event
  final case class Prompt(text: String)                       extends Event
  final case class ReceivedMessageId(id: SlackMessageId)      extends Event

  val key: ServiceKey[Event] = ServiceKey("SlackKnowledgeBotActor")

  def apply(
    client: SlackRtmClient,
    feedbackStoreActor: ActorRef[FeedbackStoreActor.Command],
    messageHandlerActor: ActorRef[SlackMessageHandlerActor.Event]
  )(implicit actorSystem: ActorSystem): Behavior[Event] =
    Behaviors.setup { context =>
      Behaviors.withStash(500) { buffer =>
        val retriever      = new GPTRetriever(Main.vectorDatabase.asRetriever, context.self ! NewToken(_))
        val retrieverActor = context.spawn(LLMRetrieverActor(context.self, retriever), "LLMRetrieverActor")

        new SlackKnowledgeBotActor(buffer, client, feedbackStoreActor, messageHandlerActor, retrieverActor)
          .free()
      }
    }
}

class SlackKnowledgeBotActor(
  buffer: StashBuffer[Event],
  client: SlackRtmClient,
  feedbackStoreActor: ActorRef[FeedbackStoreActor.Command],
  messageHandlerActor: ActorRef[SlackMessageHandlerActor.Event],
  retrieverActor: ActorRef[LLMRetrieverActor.Request]
)(implicit
  actorSystem: ActorSystem
) {
  private def free(): Behavior[Event] =
    Behaviors.receiveMessage {
      case prompt: Prompt =>
        retrieverActor ! LLMRetrieverActor.Request(prompt.text)

        waitForMessageId(prompt.text)
      case _ =>
        Behaviors.unhandled
    }

  private def llm(
    channel: String,
    input: String,
    currentMessage: String,
    timestamp: String
  ): Behavior[Event] =
    Behaviors.receive { (context, message) =>
      message match {
        case token: NewToken if token.token.isEmpty =>
          Behaviors.same
        case token: NewToken =>
          val newMessage = currentMessage + token.token

          context.pipeToSelf(client.apiClient.client.updateChatMessage(channel, timestamp, newMessage))(_ =>
            MessageUpdated
          )

          waitForMessageUpdate(channel, input, newMessage, timestamp)
        case response: LLMResponse =>
          implicit val ec: ExecutionContextExecutor = context.executionContext
          implicit val scheduler: Scheduler         = actorSystem.scheduler

          context.pipeToSelf(
            akka.pattern.retry(
              attempt = () => {
                val slackResponse = createSlackMessage(response.response)

                for {
                  _ <-
                    client.apiClient.client.updateChatMessage(channel, timestamp, slackResponse)
                  _ <- client.apiClient.client.addReactionToMessage("+1", channel, timestamp)
                  _ <- client.apiClient.client.addReactionToMessage("-1", channel, timestamp)
                } yield slackResponse
              },
              attempts = 10,
              delayFunction = attempted => Option(5.seconds * attempted)
            )
          ) { case Success(slackResponse) =>
            SentResponse(slackResponse)
          }

          waitForSentResponse(channel, input, timestamp)
        case _ =>
          Behaviors.unhandled
      }
    }

  private def waitForMessageId(input: String): Behavior[Event] =
    Behaviors.receiveMessage {
      case ReceivedMessageId(id) =>
        buffer.unstashAll(llm(id.channel, input, "", id.timestamp))
      case token: NewToken if token.token.isEmpty =>
        Behaviors.same
      case token: NewToken =>
        buffer.stash(token)

        Behaviors.same
      case response: LLMResponse =>
        buffer.stash(response)

        Behaviors.same
      case _ =>
        Behaviors.unhandled
    }

  private def waitForMessageUpdate(
    channel: String,
    input: String,
    currentMessage: String,
    timestamp: String
  ): Behavior[Event] =
    Behaviors.receiveMessage {
      case _: MessageUpdated.type =>
        buffer.unstash(llm(channel, input, currentMessage, timestamp), 1, identity)
      case token: NewToken if token.token.isEmpty =>
        Behaviors.same
      case token: NewToken =>
        buffer.stash(token)

        Behaviors.same
      case response: LLMResponse =>
        buffer.stash(response)

        Behaviors.same
      case _ =>
        Behaviors.unhandled
    }

  private def waitForSentResponse(
    channel: String,
    input: String,
    timestamp: String
  ): Behavior[Event] =
    Behaviors.receiveMessage {
      case SentResponse(response) =>
        feedbackStoreActor ! FeedbackStoreActor.CacheInteraction(
          Interaction(SlackMessageId(channel, timestamp), input, response)
        )
        messageHandlerActor ! SlackMessageHandlerActor.BotReady

        free()
      case _ =>
        Behaviors.unhandled
    }

  private def createSlackMessage(llmResponse: Map[String, py.Any]): String = {
    val result = llmResponse("result").as[String]

    val sources = Option(llmResponse("source_documents").as[List[Document]])
      .filter(_.nonEmpty)
      .fold("") { documents =>
        "\n\n" + "*Relevant documents:* " + documents.map { doc =>
          embedSlackLink(
            doc.metadata("source"),
            doc.metadata("topic")
          )
        }.distinct.mkString(", ")
      }

    result + sources
  }

  private def embedSlackLink(link: String, text: String): String =
    s"<$link|$text>"
}
