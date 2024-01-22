package io.lambdaworks.knowledgebot.api.route

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import akka.http.scaladsl.marshalling.sse.EventStreamMarshalling._
import akka.http.scaladsl.model.sse.ServerSentEvent
import akka.http.scaladsl.server.Directives.{complete, path, post, _}
import akka.http.scaladsl.server.Route
import akka.stream.scaladsl.Source
import akka.util.Timeout
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.ApiResponse
import io.lambdaworks.knowledgebot.actor.MessageRouterActor
import io.lambdaworks.knowledgebot.api.protocol.ApiJsonProtocol._
import spray.json.enrichAny

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContextExecutor, Future}

final class ChatRoutes(messageRouterActor: ActorRef[MessageRouterActor.Event])(implicit val system: ActorSystem[_]) {
  implicit val executionContext: ExecutionContextExecutor = system.executionContext

  private implicit val timeout: Timeout = 5.seconds

  private def postChatMessage(message: ChatMessage): Future[Source[ServerSentEvent, _]] =
    messageRouterActor
      .ask[Source[(ApiResponse, String), _]](MessageRouterActor.ChatMessage(None, message.text, _))
      .map(source => source.map(response => ServerSentEvent(response._1.toJson.compactPrint, response._2)))

  val chatRoutes: Route =
    path("chat") {
      post {
        entity(as[ChatMessage]) { message =>
          onSuccess(postChatMessage(message)) { source =>
            complete(source)
          }
        }
      }
    }
}

case class ChatMessage(text: String)
