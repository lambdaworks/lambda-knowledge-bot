package io.lambdaworks.knowledgebot.api

import com.softwaremill.session.{
  JValueSessionSerializer,
  JwtSessionEncoder,
  SessionConfig,
  SessionManager,
  SessionSerializer
}
import org.json4s.JValue

object JwtSessionManager {
  final case class SessionData(value: String)

  implicit val serializer: SessionSerializer[SessionData, JValue] = JValueSessionSerializer.caseClass[SessionData]
  implicit val encoder: JwtSessionEncoder[SessionData]            = new JwtSessionEncoder[SessionData]
  implicit val manager: SessionManager[SessionData]               = new SessionManager(SessionConfig.fromConfig())
}
