package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, ActorSystem, Behavior}
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.SessionInfo
import io.lambdaworks.knowledgebot.actor.model.{Chat, ChatMessage}
import org.joda.time.{DateTime, DateTimeZone}

import java.util.UUID

object MessageRouterActor {
  sealed trait Event
  final case class UserChatsRequest(userId: String, replyBack: ActorRef[List[Chat]]) extends Event
  final case class NewUserMessage(
    chatId: Option[String],
    userId: String,
    content: String,
    replyBack: ActorRef[SessionInfo]
  ) extends Event
  final case class ChatHistoryRequest(chatId: String, replyBack: ActorRef[List[ChatMessage]]) extends Event
  final case class SessionExpired(session: String)                                            extends Event

  def apply()(implicit system: ActorSystem[_]): Behavior[Event] =
    route(Map.empty)

  def route(
    sessionActors: Map[String, (Chat, ActorRef[KnowledgeBotActor.Event])]
  )(implicit system: ActorSystem[_]): Behavior[Event] =
    Behaviors.receive { (context, event) =>
      event match {
        case UserChatsRequest(userId, replyBack) =>
          replyBack ! sessionActors.toList.map(_._2._1).filter(_.userId == userId)

          Behaviors.same
        case NewUserMessage(chatId, userId, content, replyBack) =>
          chatId
            .flatMap(sessionActors.get)
            .fold {
              val chatId      = UUID.randomUUID().toString
              val sessionActor = context.spawn(KnowledgeBotActor(chatId, context.self), s"KnowledgeBotActor-$chatId")

              sessionActor ! KnowledgeBotActor.NewUserMessage(content, replyBack)

              route(
                sessionActors + (chatId -> (Chat(chatId, userId, content, DateTime.now(DateTimeZone.UTC)), sessionActor))
              )
            } { sessionTuple =>
              sessionTuple._2 ! KnowledgeBotActor.NewUserMessage(content, replyBack)

              route(sessionActors)
            }
        case ChatHistoryRequest(chatId, replyBack) =>
          sessionActors.get(chatId) match {
            case Some((_, chatActor)) =>
              chatActor ! KnowledgeBotActor.MessageHistoryRequest(replyBack)
          }

          Behaviors.same
        case SessionExpired(session) =>
          route(sessionActors.removed(session))
      }
    }
}
