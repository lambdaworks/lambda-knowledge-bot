package io.lambdaworks.knowledgebot.actor.model

import org.joda.time.DateTime

sealed trait ChatMessage {
  def id: String
  def userId: String
  def chatId: String
  def createdAt(): DateTime
  def content: String
  def role: MessageRole
}

final case class UserMessage(
  id: String,
  userId: String,
  chatId: String,
  createdAt: DateTime,
  content: String,
  feedback: Option[Feedback],
  role: MessageRole = User
) extends ChatMessage

final case class AssistantMessage(
  id: String,
  userId: String,
  chatId: String,
  createdAt: DateTime,
  content: String,
  relevantDocuments: List[Document],
  role: MessageRole = Assistant
) extends ChatMessage
