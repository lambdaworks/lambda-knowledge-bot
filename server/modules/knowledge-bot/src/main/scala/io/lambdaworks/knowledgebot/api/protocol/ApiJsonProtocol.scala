package io.lambdaworks.knowledgebot.api.protocol

import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.{Document, ResponseData}
import io.lambdaworks.knowledgebot.api.route.ChatMessage
import spray.json.DefaultJsonProtocol._
import spray.json.RootJsonFormat

object ApiJsonProtocol {
  implicit val chatMessageJsonFormat: RootJsonFormat[ChatMessage] =
    jsonFormat1(ChatMessage.apply)

  implicit val documentJsonFormat: RootJsonFormat[Document] =
    jsonFormat2(Document.apply)

  implicit val responseJsonFormat: RootJsonFormat[ResponseData] =
    jsonFormat2(ResponseData.apply)
}
