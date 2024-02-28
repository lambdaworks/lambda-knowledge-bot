package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, ActorSystem, Behavior}
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.SessionInfo
import io.lambdaworks.knowledgebot.actor.model.{Chat, ChatMessage}
import io.lambdaworks.knowledgebot.repository.dynamodb.{ChatMessageRepository, ChatRepository}
import org.joda.time.{DateTime, DateTimeZone}

import java.util.UUID

object MessageRouterActor {
  sealed trait Event
  final case class UserChatsRequest(userId: String, replyBack: ActorRef[List[Chat]]) extends Event
  final case class NewUserMessage(
    chatId: Option[String],
    userId: String,
    content: String,
    replyBack: ActorRef[SessionInfo]
  ) extends Event
  final case class ChatHistoryRequest(userId: String, chatId: String, replyBack: ActorRef[List[ChatMessage]])
      extends Event
  final case class SessionExpired(session: String) extends Event

  def apply(chatRepository: ChatRepository, chatMessageRepository: ChatMessageRepository)(implicit
    system: ActorSystem[_]
  ): Behavior[Event] =
    route(chatRepository, chatMessageRepository)

  def route(chatRepository: ChatRepository, chatMessageRepository: ChatMessageRepository)(implicit
    system: ActorSystem[_]
  ): Behavior[Event] =
    Behaviors.receive { (context, event) =>
      event match {
        case UserChatsRequest(userId, replyBack) =>
          val chatsDB = chatRepository.getAllForUser(userId)
          replyBack ! chatsDB
          Behaviors.same
        case NewUserMessage(chatId, userId, content, replyBack) =>
          val chat = chatId.fold {
            val chatId = UUID.randomUUID().toString
            val chat   = Chat(chatId, userId, content, DateTime.now(DateTimeZone.UTC))
            chatRepository.put(chat)
            chat
          } { chatId =>
            chatRepository
              .get(userId, chatId)
              .fold {
                val chat = Chat(chatId, userId, content, DateTime.now(DateTimeZone.UTC))
                chatRepository.put(chat)
                chat
              } { chat =>
                chat
              }
          }

          val knowledgeBotActor =
            context.spawn(KnowledgeBotActor(chat, chatMessageRepository, context.self), s"KnowledgeBotActor-${chat.id}")
          knowledgeBotActor ! KnowledgeBotActor.NewUserMessage(content, replyBack)

          route(chatRepository, chatMessageRepository)
        case ChatHistoryRequest(userId, chatId, replyBack) =>
          val chatMessagesDB = chatMessageRepository.getAllForUserAndChat(userId, chatId)
          replyBack ! chatMessagesDB

          Behaviors.same
      }
    }
}
