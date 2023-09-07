package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.Behavior
import akka.actor.typed.scaladsl.Behaviors
import io.lambdaworks.knowledgebot.actor.model.{Feedback, Interaction, InteractionFeedback, SlackMessageId}
import io.lambdaworks.knowledgebot.repository.Repository

import scala.concurrent.duration.DurationInt

object FeedbackStoreActor {
  sealed trait Command

  final case class CacheInteraction(interaction: Interaction)                       extends Command
  final case class StoreInteractionFeedback(id: SlackMessageId, feedback: Feedback) extends Command
  private final case class InteractionTimeout(id: SlackMessageId)                   extends Command

  def apply(repository: Repository[InteractionFeedback]): Behavior[Command] =
    store(Map.empty, repository)

  def store(
    interactions: Map[SlackMessageId, Interaction],
    repository: Repository[InteractionFeedback]
  ): Behavior[Command] =
    Behaviors.receive { (context, message) =>
      message match {
        case CacheInteraction(interaction) =>
          context.scheduleOnce(1.minutes, context.self, InteractionTimeout(interaction.id))

          store(interactions.updated(interaction.id, interaction), repository)
        case StoreInteractionFeedback(id, feedback) =>
          interactions.get(id).foreach { interaction =>
            repository.put(InteractionFeedback(feedback, interaction))
          }

          Behaviors.same
        case InteractionTimeout(timestamp) =>
          store(interactions.removed(timestamp), repository)
      }
    }
}
