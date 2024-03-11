package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, ActorSystem, Behavior}
import akka.stream.BoundedSourceQueue
import akka.stream.scaladsl.Source
import io.lambdaworks.knowledgebot.Main
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.{
  Event,
  LLMResponse,
  MessageToken,
  NewUserMessage,
  ResponseData,
  ServerSentEvent,
  SessionInfo
}
import io.lambdaworks.knowledgebot.actor.model.{AssistantMessage, Chat, Document, UserMessage}
import io.lambdaworks.knowledgebot.api.route.ChatRoutes
import io.lambdaworks.knowledgebot.repository.dynamodb.ChatMessageRepository
import io.lambdaworks.knowledgebot.retrieval.openai.GPTRetriever
import io.lambdaworks.langchain.schema.document.{Document => LangchainDocument}
import me.shadaj.scalapy.py
import org.joda.time.{DateTime, DateTimeZone}

import java.util.UUID

object KnowledgeBotActor {
  sealed trait Event
  final case class NewUserMessage(content: String, replyBack: ActorRef[SessionInfo]) extends Event
  private final case class MessageToken(text: String)                                extends Event
  private final case class LLMResponse(response: Map[String, py.Any])                extends Event

  final case class ResponseData(
    messageToken: String,
    relevantDocuments: Option[List[Document]],
    chat: Option[Chat]
  )
  final case class ServerSentEvent(data: ResponseData, `type`: String)
  final case class SessionInfo(source: Source[ServerSentEvent, _], session: String)

  def apply(chat: Chat, chatMessageRepository: ChatMessageRepository)(implicit
    system: ActorSystem[_]
  ): Behavior[Event] =
    Behaviors.setup { context =>
      val replyBack = context.messageAdapter[LLMRetrieverActor.Response](response => LLMResponse(response.response))

      val conversationHistory = chatMessageRepository
        .getAllForUserAndChat(chat.userId, chat.id, 20)
        .reverse
        .grouped(2)
        .collect { case List(input, output) =>
          (input.content, output.content)
        }
        .toList

      val retriever =
        new GPTRetriever(
          Main.vectorDatabase.asRetriever,
          context.self ! MessageToken(_),
          conversationHistory = Some(conversationHistory)
        )
      val retrieverActor = context.spawn(LLMRetrieverActor(replyBack, retriever), "LLMRetrieverActor")

      new KnowledgeBotActor(chat, retrieverActor, chatMessageRepository).acceptEvents()
    }
}

private final class KnowledgeBotActor(
  chat: Chat,
  retrieverActor: ActorRef[LLMRetrieverActor.Request],
  chatMessageRepository: ChatMessageRepository
)(implicit val system: ActorSystem[_]) {
  private def acceptEvents(): Behavior[Event] =
    Behaviors.receiveMessage { case NewUserMessage(content, replyBack) =>
      val (queue, source) = Source.queue[ServerSentEvent](1).preMaterialize()

      replyBack ! SessionInfo(source, chat.id)

      retrieverActor ! LLMRetrieverActor.Request(content)

      if (chat.userId != ChatRoutes.Anonymous) {
        val msgId       = UUID.randomUUID().toString
        val userMessage = UserMessage(msgId, chat.userId, chat.id, DateTime.now(DateTimeZone.UTC), content, None)
        chatMessageRepository.put(userMessage)
      }

      processMessageTokens(queue)
    }

  private def processMessageTokens(
    queue: BoundedSourceQueue[ServerSentEvent]
  ): Behavior[Event] =
    Behaviors.receiveMessage {
      case _: NewUserMessage =>
        Behaviors.same
      case MessageToken(text) =>
        if (text.nonEmpty) {
          queue.offer(ServerSentEvent(ResponseData(messageToken = text, None, None), "in_progress"))
        }

        Behaviors.same
      case LLMResponse(response) =>
        val relevantDocuments = response("source_documents")
          .as[List[LangchainDocument]]
          .map(d => Document(source = d.metadata("source"), topic = d.metadata("topic")))
          .distinct

        queue.offer(
          ServerSentEvent(
            ResponseData(
              messageToken = "",
              relevantDocuments = Some(relevantDocuments),
              chat = Some(chat)
            ),
            "finish"
          )
        )

        if (chat.userId != ChatRoutes.Anonymous) {
          val msgId = UUID.randomUUID().toString
          val assistantMessage = AssistantMessage(
            msgId,
            chat.userId,
            chat.id,
            DateTime.now(DateTimeZone.UTC),
            response("result").as[String],
            relevantDocuments
          )
          chatMessageRepository.put(assistantMessage)
        }

        Behaviors.stopped
    }
}
