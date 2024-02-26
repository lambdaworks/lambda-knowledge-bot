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
import ch.megard.akka.http.cors.scaladsl.CorsDirectives._
import ch.megard.akka.http.cors.scaladsl.settings.CorsSettings
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.SessionInfo
import io.lambdaworks.knowledgebot.actor.MessageRouterActor
import io.lambdaworks.knowledgebot.actor.model.{Chat, ChatMessage}
import io.lambdaworks.knowledgebot.api.protocol.ApiJsonProtocol._
import io.lambdaworks.knowledgebot.api.route.ChatRoutes.NewUserMessage
import io.lambdaworks.knowledgebot.api.auth.AuthService
import spray.json.DefaultJsonProtocol._
import spray.json.enrichAny
import scala.concurrent.duration.DurationInt
import scala.concurrent.{ExecutionContextExecutor, Future}

final class ChatRoutes(messageRouterActor: ActorRef[MessageRouterActor.Event], authService: AuthService)(implicit
  val system: ActorSystem[_]
) {
  implicit val executionContext: ExecutionContextExecutor = system.executionContext

  private implicit val timeout: Timeout = 5.seconds

  private val corsSettings: CorsSettings =
    CorsSettings.defaultSettings.withAllowGenericHttpRequests(true).withExposedHeaders(Seq("Set-Authorization"))

  private def getChats(userId: String): Future[List[Chat]] =
    messageRouterActor.ask[List[Chat]](MessageRouterActor.UserChatsRequest(userId, _))

  private def getChatHistory(chatId: String): Future[List[ChatMessage]] =
    messageRouterActor.ask[List[ChatMessage]](MessageRouterActor.ChatHistoryRequest(chatId, _))

  private def postChatMessage(
    message: NewUserMessage,
    chatId: Option[String],
    userId: String
  ): Future[Source[ServerSentEvent, _]] =
    messageRouterActor
      .ask[SessionInfo](MessageRouterActor.NewUserMessage(chatId, userId, message.content, _))
      .map(_.source.map(response => ServerSentEvent(response.data.toJson.compactPrint, response.`type`)))

  val chatRoutes: Route =
    cors(corsSettings) {
      pathPrefix("chats") {
        pathEnd {
          get {
            authService.authenticated { userId =>
              onSuccess(getChats(userId)) { chats =>
                complete(chats)
              }
            }
          } ~
            post {
              authService.authenticated { userId =>
                entity(as[NewUserMessage]) { message =>
                  onSuccess(postChatMessage(message, None, userId)) { source =>
                    complete(source)
                  }
                }
              }
            }
        } ~
          path(Segment) { chatId =>
            pathEnd {
              post {
                authService.authenticated { userId =>
                  entity(as[NewUserMessage]) { message =>
                    onSuccess(postChatMessage(message, Some(chatId), userId)) { source =>
                      complete(source)
                    }
                  }
                }
              }
            }
          } ~
          path(Segment / "messages") { chatId =>
            pathEnd {
              get {
                onSuccess(getChatHistory(chatId)) { messages =>
                  complete(messages)
                }
              }
            }
          }
      }
    }
}

object ChatRoutes {
  final case class NewUserMessage(content: String)
}
