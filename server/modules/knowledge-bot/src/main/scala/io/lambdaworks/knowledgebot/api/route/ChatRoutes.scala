package io.lambdaworks.knowledgebot.api.route

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import akka.http.scaladsl.marshalling.sse.EventStreamMarshalling._
import akka.http.scaladsl.model.sse.ServerSentEvent
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.stream.scaladsl.Source
import akka.util.Timeout
import com.softwaremill.session.SessionDirectives.{optionalSession, setSession}
import com.softwaremill.session.SessionOptions.oneOff
import com.softwaremill.session.{HeaderST, SetSessionTransport}
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.SessionInfo
import io.lambdaworks.knowledgebot.actor.MessageRouterActor
import io.lambdaworks.knowledgebot.api.JwtSessionManager._
import io.lambdaworks.knowledgebot.api.protocol.ApiJsonProtocol._
import spray.json.enrichAny

import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContextExecutor, Future}
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import ch.megard.akka.http.cors.scaladsl.settings.CorsSettings

final class ChatRoutes(messageRouterActor: ActorRef[MessageRouterActor.Event])(implicit val system: ActorSystem[_]) {
  implicit val executionContext: ExecutionContextExecutor = system.executionContext

  private implicit val timeout: Timeout = 5.seconds

  private val sessionTransport: SetSessionTransport = HeaderST

  val corsSettings: CorsSettings = CorsSettings.defaultSettings.withAllowGenericHttpRequests(true)

  private def postChatMessage(
    message: ChatMessage,
    session: Option[SessionData]
  ): Future[(Source[ServerSentEvent, _], String)] =
    messageRouterActor
      .ask[SessionInfo](MessageRouterActor.ChatMessage(session.map(_.value), message.text, _))
      .map(info =>
        (info.source.map(response => ServerSentEvent(response.data.toJson.compactPrint, response.`type`)), info.session)
      )

  val chatRoutes: Route =
      cors(corsSettings) {
        path("chat") {
          post {
            optionalSession(oneOff, sessionTransport) { session =>
              entity(as[ChatMessage]) { message =>
                onSuccess(postChatMessage(message, session)) { (source, session) =>
                  setSession(oneOff, sessionTransport, SessionData(session)) {
                    complete(source)
                  }
                }
              }
            }
          }
        }
      }
      
}

case class ChatMessage(text: String)
