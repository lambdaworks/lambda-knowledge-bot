package io.lambdaworks.knowledgebot.actor.slack

import akka.actor.typed.ActorRef
import akka.actor.typed.scaladsl.adapter.ClassicActorContextOps
import akka.actor.{Actor, ActorSystem}
import io.lambdaworks.knowledgebot.actor.model._
import io.lambdaworks.knowledgebot.actor.slack.SlackMessageListenerActor.reactionRegex
import io.lambdaworks.knowledgebot.repository.Repository
import slack.SlackUtil.{extractMentionedIds, isDirectMsg}
import slack.models.{Message => SlackMessage, ReactionAdded, ReactionItemMessage}
import slack.rtm.SlackRtmClient

import scala.util.matching.Regex

class SlackMessageListenerActor(client: SlackRtmClient, repository: Repository[InteractionFeedback]) extends Actor {
  implicit val system: ActorSystem = context.system

  val router: ActorRef[SlackEventRouterActor.Event] =
    context.spawn(SlackEventRouterActor(client, repository), "SlackEventRouterActor")

  val selfId: String = client.state.self.id

  val botMention: String = s"@$selfId"

  def receive: Receive = {
    case message: SlackMessage =>
      message.user.foreach { userId =>
        val mentionedIds = extractMentionedIds(message.text)

        if ((isDirectMsg(message) || mentionedIds.contains(selfId)) && userId != selfId && message.bot_id.isEmpty) {
          router ! SlackEventRouterActor.MessageFrom(
            userId,
            Message(SlackMessageId(message.channel, message.ts), message.text.replaceAll(botMention, ""))
          )
        }
      }
    case ReactionAdded(reaction, ReactionItemMessage(channel, timestamp), _, user, _)
        if user != selfId && reactionRegex.pattern.matcher(reaction).matches() =>
      Option(reaction).collect {
        case reaction if reaction.startsWith("+1") => Positive
        case _                                     => Negative
      }.foreach(router ! SlackEventRouterActor.InteractionFeedbackEvent(SlackMessageId(channel, timestamp), _))
    case _ => ()
  }
}

object SlackMessageListenerActor {
  val reactionRegex: Regex = "[+-]1(::skin-tone-[2-6])?".r
}
