package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.ActorRef
import akka.actor.typed.scaladsl.adapter.{ClassicActorContextOps, ClassicActorSystemOps}
import akka.actor.{Actor, ActorSystem, Scheduler}
import io.lambdaworks.knowledgebot.actor.model.{InteractionFeedback, Message, Negative, Positive, SlackMessageId}
import io.lambdaworks.knowledgebot.repository.Repository
import slack.SlackUtil.{extractMentionedIds, isDirectMsg}
import slack.models.{Message => SlackMessage, ReactionAdded, ReactionItemMessage}
import slack.rtm.SlackRtmClient

import scala.concurrent.ExecutionContextExecutor

class SlackMessageListenerActor(client: SlackRtmClient, repository: Repository[InteractionFeedback]) extends Actor {
  implicit val system: ActorSystem          = context.system
  implicit val ec: ExecutionContextExecutor = system.toTyped.executionContext
  implicit val scheduler: Scheduler         = system.scheduler

  val router: ActorRef[SlackMessageRouterActor.Event] =
    context.spawn(SlackMessageRouterActor(client, repository), "SlackMessageRouterActor")

  val selfId: String = client.state.self.id

  def receive: Receive = {
    case message: SlackMessage =>
      message.user.foreach { userId =>
        val mentionedIds = extractMentionedIds(message.text)

        if ((isDirectMsg(message) || mentionedIds.contains(selfId)) && userId != selfId && message.bot_id.isEmpty) {
          router ! SlackMessageRouterActor.MessageFrom(
            userId,
            Message(SlackMessageId(message.channel, message.ts), message.text)
          )
        }
      }
    case ReactionAdded(reaction, ReactionItemMessage(channel, timestamp), _, _, _)
        if reaction == "+1" || reaction == "-1" =>
      Option(reaction).collect {
        case "+1" => Positive
        case "-1" => Negative
      }.foreach(router ! SlackMessageRouterActor.InteractionFeedbackEvent(SlackMessageId(channel, timestamp), _))
    case _ => ()
  }
}
