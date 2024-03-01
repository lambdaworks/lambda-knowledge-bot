package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, ActorSystem, Behavior}
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.SessionInfo
import io.lambdaworks.knowledgebot.actor.model.{Chat, ChatMessage}
import io.lambdaworks.knowledgebot.api.route.ChatRoutes
import io.lambdaworks.knowledgebot.repository.dynamodb.{ChatMessageRepository, ChatRepository}
import org.joda.time.{DateTime, DateTimeZone}

import java.util.UUID

object MessageRouterActor {
  sealed trait Event
  final case class UserChatsRequest(
    userId: String,
    limit: Int,
    lastKey: Option[String],
    replyBack: ActorRef[List[Chat]]
  ) extends Event
  final case class NewUserMessage(
    chatId: Option[String],
    userId: String,
    content: String,
    replyBack: ActorRef[SessionInfo]
  ) extends Event
  final case class ChatHistoryRequest(
    userId: String,
    chatId: String,
    limit: Int,
    lastKey: Option[String],
    replyBack: ActorRef[List[ChatMessage]]
  ) extends Event
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
        case UserChatsRequest(userId, limit, lastKey, replyBack) =>
          val chatsDB = chatRepository.getAllForUser(userId, limit, lastKey)
          replyBack ! chatsDB
          Behaviors.same
        case NewUserMessage(chatId, userId, content, replyBack) =>
          val chat = chatId.fold {
            val chatId = UUID.randomUUID().toString
            val chat   = Chat(chatId, userId, content, DateTime.now(DateTimeZone.UTC))
            if (userId != ChatRoutes.Anonymous)
              chatRepository.put(chat)
            chat
          } { chatId =>
            chatRepository
              .get(userId, chatId)
              .fold {
                val chat = Chat(chatId, userId, content, DateTime.now(DateTimeZone.UTC))
                if (userId != ChatRoutes.Anonymous)
                  chatRepository.put(chat)
                chat
              } { chat =>
                chat
              }
          }

          val knowledgeBotActor =
            context.spawn(KnowledgeBotActor(chat, chatMessageRepository), s"KnowledgeBotActor-${chat.id}")
          knowledgeBotActor ! KnowledgeBotActor.NewUserMessage(content, replyBack)

          route(chatRepository, chatMessageRepository)
        case ChatHistoryRequest(userId, chatId, limit, lastKey, replyBack) =>
          val chatMessagesDB = chatMessageRepository.getAllForUserAndChat(userId, chatId, limit, lastKey)
          replyBack ! chatMessagesDB

          Behaviors.same
      }
    }
}
