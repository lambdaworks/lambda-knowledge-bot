package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, ActorSystem, Behavior}
import akka.stream.scaladsl.Source
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.ApiResponse

import java.util.UUID

object MessageRouterActor {
  sealed trait Event
  final case class ChatMessage(
    session: Option[String],
    text: String,
    replyBack: ActorRef[Source[(ApiResponse, String), _]]
  ) extends Event
  final case class SessionExpired(session: String) extends Event

  def apply()(implicit system: ActorSystem[_]): Behavior[Event] =
    route(Map.empty)

  def route(
    sessionActors: Map[String, ActorRef[KnowledgeBotActor.Event]]
  )(implicit system: ActorSystem[_]): Behavior[Event] =
    Behaviors.receive { (context, event) =>
      event match {
        case ChatMessage(session, text, replyBack) =>
          session
            .flatMap(sessionActors.get)
            .fold {
              val session      = UUID.randomUUID().toString
              val sessionActor = context.spawn(KnowledgeBotActor(session, context.self), s"KnowledgeBotActor-$session")

              sessionActor ! KnowledgeBotActor.ChatMessage(text, replyBack)

              route(sessionActors + (session -> sessionActor))
            } { sessionActor =>
              sessionActor ! KnowledgeBotActor.ChatMessage(text, replyBack)

              route(sessionActors)
            }
        case SessionExpired(session) =>
          route(sessionActors.removed(session))
      }
    }
}
