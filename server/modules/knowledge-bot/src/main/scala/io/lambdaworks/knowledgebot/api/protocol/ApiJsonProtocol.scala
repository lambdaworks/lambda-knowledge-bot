package io.lambdaworks.knowledgebot.api.protocol

import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.ResponseData
import io.lambdaworks.knowledgebot.actor.model.{
  Assistant,
  AssistantMessage,
  Chat,
  ChatMessage,
  Document,
  Feedback,
  MessageRole,
  Negative,
  Positive,
  User,
  UserMessage
}
import io.lambdaworks.knowledgebot.api.route.ChatRoutes.NewUserMessage
import org.joda.time.DateTime
import org.joda.time.format.{DateTimeFormatter, ISODateTimeFormat}
import spray.json.DefaultJsonProtocol._
import spray.json.{DeserializationException, JsString, JsValue, RootJsonFormat, enrichAny}

object ApiJsonProtocol {
  implicit object DateJsonFormat extends RootJsonFormat[DateTime] {
    private val parserISO: DateTimeFormatter = ISODateTimeFormat.dateTimeNoMillis()

    def write(obj: DateTime): JsString = JsString(parserISO.print(obj))

    def read(json: JsValue): DateTime = json match {
      case JsString(s) => parserISO.parseDateTime(s)
      case json        => throw DeserializationException(s"Error parsing $json as DateTime")
    }
  }

  implicit val chatJsonFormat: RootJsonFormat[Chat] =
    jsonFormat4(Chat.apply)

  implicit object FeedbackJsonFormat extends RootJsonFormat[Feedback] {
    def write(obj: Feedback): JsString = obj match {
      case Positive => JsString("positive")
      case Negative => JsString("negative")
    }

    def read(json: JsValue): Feedback = json match {
      case JsString("positive") => Positive
      case JsString("negative") => Negative
      case json                 => throw DeserializationException(s"Error parsing $json as Feedback")
    }
  }

  implicit object MessageRoleJsonFormat extends RootJsonFormat[MessageRole] {
    def write(obj: MessageRole): JsString = obj match {
      case User      => JsString("user")
      case Assistant => JsString("assistant")
    }

    def read(json: JsValue): MessageRole = json match {
      case JsString("user")      => User
      case JsString("assistant") => Assistant
      case json                  => throw DeserializationException(s"Error parsing $json as Messagerole")
    }
  }

  implicit val userMessageJsonFormat: RootJsonFormat[UserMessage] =
    jsonFormat4(UserMessage.apply)

  implicit val assistantMessageJsonFormat: RootJsonFormat[AssistantMessage] =
    jsonFormat4(AssistantMessage.apply)

  implicit object ChatMessageJsonFormat extends RootJsonFormat[ChatMessage] {
    def write(obj: ChatMessage): JsValue = obj match {
      case msg: UserMessage      => msg.toJson
      case msg: AssistantMessage => msg.toJson
    }

    def read(value: JsValue): ChatMessage =
      value.asJsObject.fields("role") match {
        case JsString("user")      => value.convertTo[UserMessage]
        case JsString("assistant") => value.convertTo[AssistantMessage]
        case json                  => throw DeserializationException(s"Error parsing $json as NewUserMessage")
      }
  }

  implicit val documentJsonFormat: RootJsonFormat[Document] =
    jsonFormat2(Document.apply)

  implicit val responseJsonFormat: RootJsonFormat[ResponseData] =
    jsonFormat2(ResponseData.apply)

  implicit val newUserMessageJsonFormat: RootJsonFormat[NewUserMessage] =
    jsonFormat1(NewUserMessage.apply)
}
