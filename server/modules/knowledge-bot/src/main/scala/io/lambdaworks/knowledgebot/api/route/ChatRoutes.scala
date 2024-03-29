package io.lambdaworks.knowledgebot.api.route

import akka.actor.typed.scaladsl.AskPattern._
import akka.actor.typed.{ActorRef, ActorSystem}
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
import akka.http.scaladsl.marshalling.sse.EventStreamMarshalling._
import akka.http.scaladsl.model.StatusCodes
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
import io.lambdaworks.knowledgebot.api.auth.AuthService
import io.lambdaworks.knowledgebot.api.protocol.ApiJsonProtocol.DateJsonFormat.stringToDateTime
import io.lambdaworks.knowledgebot.api.protocol.ApiJsonProtocol._
import io.lambdaworks.knowledgebot.api.route.ChatRoutes.NewUserMessage
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
    CorsSettings.defaultSettings

  private def deleteChat(chatId: String, userId: String): Future[Unit] =
    messageRouterActor.ask[Unit](MessageRouterActor.DeleteChatRequest(chatId, userId, _))

  private def deleteChats(userId: String): Future[Unit] =
    messageRouterActor.ask[Unit](MessageRouterActor.DeleteChatsRequest(userId, _))

  private def getChats(userId: String, limit: Int, lastKey: Option[String]): Future[List[Chat]] =
    messageRouterActor.ask[List[Chat]](MessageRouterActor.UserChatsRequest(userId, limit, lastKey, _))

  private def getChatHistory(
    userId: String,
    chatId: String,
    limit: Int,
    lastKey: Option[String]
  ): Future[List[ChatMessage]] =
    messageRouterActor.ask[List[ChatMessage]](MessageRouterActor.ChatHistoryRequest(userId, chatId, limit, lastKey, _))

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
              parameters("limit".withDefault(20), "lastKey".as(stringToDateTime).optional) { (limit, lastKey) =>
                onSuccess(getChats(userId, limit, lastKey.map(_.toString()))) { chats =>
                  complete(chats)
                }
              }
            }
          } ~
            post {
              authService.maybeAuthenticated { userId =>
                entity(as[NewUserMessage]) { message =>
                  onSuccess(postChatMessage(message, None, userId.getOrElse(ChatRoutes.Anonymous))) { source =>
                    complete(source)
                  }
                }
              }
            } ~
            delete {
              authService.authenticated { userId =>
                onSuccess(deleteChats(userId)) {
                  complete(StatusCodes.OK)
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
              } ~
                delete {
                  authService.authenticated { userId =>
                    onSuccess(deleteChat(chatId, userId)) {
                      complete(StatusCodes.OK)
                    }
                  }
                }
            }
          } ~
          path(Segment / "messages") { chatId =>
            pathEnd {
              get {
                authService.authenticated { userId =>
                  parameters("limit".withDefault(20), "lastKey".as(stringToDateTime).optional) { (limit, lastKey) =>
                    onSuccess(getChatHistory(userId, chatId, limit, lastKey.map(_.toString()))) { messages =>
                      complete(messages)
                    }
                  }
                }
              }
            }
          }
      }
    }
}

object ChatRoutes {
  final case class NewUserMessage(content: String)
  val Anonymous = "Anonymous"
}
