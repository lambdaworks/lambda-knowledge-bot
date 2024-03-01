package io.lambdaworks.knowledgebot.api.route

import akka.actor.typed.ActorSystem
import akka.http.scaladsl.server.Route
import akka.stream.scaladsl.Source
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor
import io.lambdaworks.knowledgebot.actor.model.{Chat, ChatMessage}
import io.lambdaworks.knowledgebot.api.protocol.ApiJsonProtocol._
import io.lambdaworks.knowledgebot.api.route.ChatRoutes.NewUserMessage
import org.joda.time.DateTime
import spray.json.DefaultJsonProtocol._
import sttp.capabilities.akka.AkkaStreams
import sttp.model.StatusCode
import sttp.model.sse.ServerSentEvent
import sttp.tapir.generic.auto._
import sttp.tapir.json.spray._
import sttp.tapir.server.akkahttp.{AkkaHttpServerInterpreter, serverSentEventsBody}
import sttp.tapir.swagger.bundle.SwaggerInterpreter
import sttp.tapir.{AnyEndpoint, Endpoint, Schema, endpoint, oneOf, oneOfVariant, path, query, statusCode, _}

import scala.concurrent.{ExecutionContextExecutor, Future}

final class SwaggerRoutes(implicit
  val system: ActorSystem[_]
) {

  implicit val executionContext: ExecutionContextExecutor = system.executionContext

  implicit val dateSchema: Schema[DateTime]                         = Schema.string[DateTime]
  implicit val chatSchema: Schema[Chat]                             = Schema.derived[Chat]
  implicit val rdSchema: Schema[KnowledgeBotActor.ResponseData]     = Schema.derived[KnowledgeBotActor.ResponseData]
  implicit val sseSchema: Schema[KnowledgeBotActor.ServerSentEvent] = Schema.derived[KnowledgeBotActor.ServerSentEvent]

  private val chatMessageEndpoint
    : Endpoint[String, NewUserMessage, Unit, Source[ServerSentEvent, Any], Any with AkkaStreams] =
    endpoint.post
      .in("chats")
      .securityIn(auth.bearer[String]())
      .in(
        jsonBody[NewUserMessage]
          .description("The message to be sent")
          .example(NewUserMessage("Hello! What is the company's Wi-Fi password?"))
      )
      .out(serverSentEventsBody.description("Successful final response with JWT token"))
//      .out(
//        jsonBody[KnowledgeBotActor.ServerSentEvent]
//          .description("Successful final response with JWT token")
//          .and(header("Content-Type", "text/event-stream"))
//      )
//      .out(streamBody(AkkaStreams)(Schema.schemaForInputStream, CodecFormat.TextEventStream()))
      .errorOut(
        oneOf(
          oneOfVariant(statusCode(StatusCode.Unauthorized).description("JWT token is invalid")),
          oneOfVariant(statusCode(StatusCode.BadRequest).description("Empty message content"))
        )
      )
      .description("Send a question to be answered with a streamed response")
      .summary("Sends a new chat message")
      .tag("ChatService")

  private val historyEndpoint: Endpoint[String, (Option[Int], Option[String]), Unit, List[Chat], Any] =
    endpoint.get
      .in("chats")
      .securityIn(auth.bearer[String]())
      .in(query[Option[Int]]("limit"))
      .in(query[Option[String]]("lastKey"))
      .out(jsonBody[List[Chat]].description("Successful final response with JWT token"))
      .errorOut(
        oneOf(
          oneOfVariant(statusCode(StatusCode.Unauthorized).description("JWT token is invalid")),
          oneOfVariant(statusCode(StatusCode.BadRequest).description("Empty message content"))
        )
      )
      .description("Retrieve all user chats")
      .summary("Retrieve all user chats")
      .tag("ChatHistoryService")

  private val deleteChatEndpoint: Endpoint[Unit, String, Unit, String, Any] =
    endpoint.delete
      .in("chat" / path[String]("chatId"))
      .out(jsonBody[String].description("Successful final response with JWT token"))
      .description("Remove user chat")
      .summary("Remove user chat")
      .tag("ChatHistoryService")

  private val deleteChatsEndpoint: Endpoint[Unit, Unit, Unit, String, Any] =
    endpoint.delete
      .in("chats")
      .out(jsonBody[String].description("Successful final response with JWT token"))
      .description("Remove user chats")
      .summary("Remove user chats")
      .tag("ChatHistoryService")

  private val chatMessagesEndpoint: Endpoint[String, (String, Option[Int], Option[String]), Unit, ChatMessage, Any] =
    endpoint.get
      .in("chats" / path[String]("chatId") / "messages")
      .securityIn(auth.bearer[String]())
      .in(query[Option[Int]]("limit"))
      .in(query[Option[String]]("lastKey"))
      .out(jsonBody[ChatMessage].description("Successful final response with JWT token"))
      .errorOut(
        oneOf(
          oneOfVariant(statusCode(StatusCode.Unauthorized).description("JWT token is invalid")),
          oneOfVariant(statusCode(StatusCode.BadRequest).description("Empty message content"))
        )
      )
      .description("Retrieve all user chats")
      .summary("Retrieve messages from certain chat")
      .tag("ChatHistoryService")

  private val likeChatMessageEndpoint: Endpoint[Unit, (String, String), Unit, String, Any] =
    endpoint.put
      .in("chat" / "message" / "like")
      .in(query[String]("chatId"))
      .in(query[String]("messageId"))
      .out(jsonBody[String].description("Successful final response with JWT token"))
      .description("Like bot message")
      .summary("Like bot message")
      .tag("ChatHistoryService")

  private val dislikeChatMessageEndpoint: Endpoint[Unit, (String, String), Unit, String, Any] =
    endpoint.put
      .in("chat" / "message" / "dislike")
      .in(query[String]("chatId"))
      .in(query[String]("messageId"))
      .out(jsonBody[String].description("Successful final response with JWT token"))
      .description("Dislike bot message")
      .summary("Dislike bot message")
      .tag("ChatHistoryService")

  private val myEndpoints: List[AnyEndpoint] = List(
    chatMessageEndpoint,
    historyEndpoint,
    deleteChatEndpoint,
    deleteChatsEndpoint,
    chatMessagesEndpoint,
    likeChatMessageEndpoint,
    dislikeChatMessageEndpoint
  )

  private val swaggerEndpoints = SwaggerInterpreter().fromEndpoints[Future](myEndpoints, "Knowle API", "1.0.0")

  val swaggerRoute: Route = AkkaHttpServerInterpreter().toRoute(swaggerEndpoints)

}
