package io.lambdaworks.knowledgebot.actor

import akka.actor.ActorSystem
import akka.actor.typed.receptionist.Receptionist.Find
import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import akka.util.Timeout
import io.lambdaworks.knowledgebot.actor.SlackMessageRouterActor.{
  Event,
  InteractionFeedbackEvent,
  MessageFrom,
  MessageTo
}
import io.lambdaworks.knowledgebot.actor.model.{Feedback, InteractionFeedback, Message, SlackMessageId}
import io.lambdaworks.knowledgebot.repository.Repository
import slack.rtm.SlackRtmClient

import scala.concurrent.duration.DurationInt
import scala.util.Success

object SlackMessageRouterActor {
  sealed trait Event

  final case class MessageFrom(userId: String, message: Message) extends Event
  final case class MessageTo(
    actorRef: ActorRef[SlackMessageHandlerActor.Event],
    message: Message
  ) extends Event
  final case class InteractionFeedbackEvent(id: SlackMessageId, feedback: Feedback) extends Event

  def apply(client: SlackRtmClient, repository: Repository[InteractionFeedback])(implicit
    actorSystem: ActorSystem
  ): Behavior[Event] =
    Behaviors.setup { context =>
      val feedbackStoreActor = context.spawn(FeedbackStoreActor(repository), "FeedbackStoreActor")

      new SlackMessageRouterActor(client, feedbackStoreActor).route()
    }
}

class SlackMessageRouterActor(client: SlackRtmClient, feedbackStoreActor: ActorRef[FeedbackStoreActor.Command])(implicit
  actorSystem: ActorSystem
) {
  private def route()(implicit timeout: Timeout = 1.second): Behavior[Event] =
    Behaviors.receive { (context, message) =>
      message match {
        case MessageFrom(userId, message) =>
          context.ask(context.system.receptionist, Find(SlackMessageHandlerActor.key)) { case Success(listing) =>
            val actorInstances = listing.serviceInstances(SlackMessageHandlerActor.key)
            val actor = actorInstances.find { actor =>
              actor.path.name.contentEquals(messageHandlerName(userId))
            }.getOrElse {
              val messageHandlerActor =
                context.spawn(SlackMessageHandlerActor(client, feedbackStoreActor), messageHandlerName(userId))

              messageHandlerActor
            }

            MessageTo(actor, message)
          }

          Behaviors.same
        case MessageTo(actorRef, message) =>
          actorRef ! SlackMessageHandlerActor.NewMessage(message)

          Behaviors.same
        case InteractionFeedbackEvent(id, feedback) =>
          feedbackStoreActor ! FeedbackStoreActor.StoreInteractionFeedback(id, feedback)

          Behaviors.same
      }
    }

  private def messageHandlerName(id: String) =
    s"SlackMessageHandlerActor-$id"
}
