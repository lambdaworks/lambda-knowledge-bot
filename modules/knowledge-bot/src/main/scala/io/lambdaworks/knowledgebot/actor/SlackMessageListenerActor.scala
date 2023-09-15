package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.ActorRef
import akka.actor.typed.scaladsl.adapter.ClassicActorContextOps
import akka.actor.{Actor, ActorSystem}
import io.lambdaworks.knowledgebot.actor.model.{InteractionFeedback, Message, Negative, Positive, SlackMessageId}
import io.lambdaworks.knowledgebot.repository.Repository
import slack.SlackUtil.{extractMentionedIds, isDirectMsg}
import slack.models.{Message => SlackMessage, ReactionAdded, ReactionItemMessage}
import slack.rtm.SlackRtmClient

class SlackMessageListenerActor(client: SlackRtmClient, repository: Repository[InteractionFeedback]) extends Actor {
  implicit val system: ActorSystem = context.system

  val router: ActorRef[SlackEventRouterActor.Event] =
    context.spawn(SlackEventRouterActor(client, repository), "SlackEventRouterActor")

  val selfId: String = client.state.self.id

  def receive: Receive = {
    case message: SlackMessage =>
      message.user.foreach { userId =>
        val mentionedIds = extractMentionedIds(message.text)

        if ((isDirectMsg(message) || mentionedIds.contains(selfId)) && userId != selfId && message.bot_id.isEmpty) {
          router ! SlackEventRouterActor.MessageFrom(
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
      }.foreach(router ! SlackEventRouterActor.InteractionFeedbackEvent(SlackMessageId(channel, timestamp), _))
    case _ => ()
  }
}
