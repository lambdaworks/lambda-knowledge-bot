package io.lambdaworks.knowledgebot.actor.model

import org.joda.time.DateTime

sealed trait ChatMessage {
  def createdAt(): DateTime
  def content: String
  def role: MessageRole
}

final case class UserMessage(
  createdAt: DateTime,
  content: String,
  feedback: Option[Feedback],
  role: MessageRole = User
) extends ChatMessage

final case class AssistantMessage(
  createdAt: DateTime,
  content: String,
  relevantDocuments: List[Document],
  role: MessageRole = Assistant
) extends ChatMessage
