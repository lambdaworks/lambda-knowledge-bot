package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.receptionist.{Receptionist, ServiceKey}
import akka.actor.typed.scaladsl.{Behaviors, StashBuffer}
import akka.actor.typed.{ActorRef, Behavior}
import akka.actor.{ActorSystem, Scheduler}
import io.lambdaworks.knowledgebot.actor.SlackMessageHandlerActor.{
  BotReady,
  Event,
  InactivityTimeout,
  NewMessage,
  QueuedMessage
}
import io.lambdaworks.knowledgebot.actor.model.{Message, SlackMessageId}
import slack.rtm.SlackRtmClient

import scala.concurrent.ExecutionContext
import scala.concurrent.duration.DurationInt
import scala.util.Success

object SlackMessageHandlerActor {
  sealed trait Event

  final case class NewMessage(message: Message)    extends Event
  final case class QueuedMessage(message: Message) extends Event
  final case object BotReady                       extends Event
  final case object InactivityTimeout              extends Event

  val key: ServiceKey[Event] = ServiceKey("SlackMessageHandlerActor")

  def apply(client: SlackRtmClient, feedbackStoreActor: ActorRef[FeedbackStoreActor.Command], userId: String)(implicit
    actorSystem: ActorSystem,
    executionContext: ExecutionContext,
    scheduler: Scheduler
  ): Behavior[Event] =
    Behaviors.setup { context =>
      context.system.receptionist ! Receptionist.Register(key, context.self)
      context.setReceiveTimeout(5.minutes, InactivityTimeout)

      val botActor =
        context.spawn(SlackKnowledgeBotActor(client, feedbackStoreActor, context.self), botActorName(userId))

      Behaviors.withStash(10) { buffer =>
        new SlackMessageHandlerActor(botActor, client).botFree(buffer)
      }
    }

  private def botActorName(id: String) =
    s"SlackKnowledgeBotActor-$id"
}

class SlackMessageHandlerActor(botActor: ActorRef[SlackKnowledgeBotActor.Event], client: SlackRtmClient)(implicit
  actorSystem: ActorSystem,
  executionContext: ExecutionContext
) {
  def botFree(buffer: StashBuffer[Event]): Behavior[Event] =
    Behaviors.receiveMessage {
      case NewMessage(Message(id, text)) =>
        botActor ! SlackKnowledgeBotActor.Prompt(text)

        client.apiClient.client
          .postChatMessage(
            id.channel,
            "*Generating response...*",
            unfurlLinks = Some(false),
            threadTs = Some(id.timestamp)
          )
          .foreach { timestamp =>
            botActor ! SlackKnowledgeBotActor.ReceivedMessageId(SlackMessageId(id.channel, timestamp))
          }

        botBusy(buffer)
      case QueuedMessage(Message(id, text)) =>
        botActor ! SlackKnowledgeBotActor.Prompt(text)
        botActor ! SlackKnowledgeBotActor.ReceivedMessageId(id)

        client.apiClient.client.updateChatMessage(
          id.channel,
          id.timestamp,
          "*Generating response...*",
          threadTs = Some(id.timestamp)
        )

        botBusy(buffer)
      case InactivityTimeout =>
        Behaviors.stopped
      case _ =>
        Behaviors.unhandled
    }

  def botBusy(buffer: StashBuffer[Event]): Behavior[Event] =
    Behaviors.receive { (context, message) =>
      message match {
        case NewMessage(Message(id, text)) =>
          context.pipeToSelf(
            client.apiClient.client.postChatMessage(
              id.channel,
              "*In queue...*",
              unfurlLinks = Some(false),
              threadTs = Some(id.timestamp)
            )
          ) { case Success(timestamp) =>
            QueuedMessage(Message(SlackMessageId(id.channel, timestamp), text))
          }

          Behaviors.same
        case message: QueuedMessage =>
          buffer.stash(message)

          Behaviors.same
        case BotReady =>
          buffer.unstash(botFree(buffer), 1, identity)
        case InactivityTimeout =>
          Behaviors.stopped
      }
    }
}
