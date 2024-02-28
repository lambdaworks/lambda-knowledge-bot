package io.lambdaworks.knowledgebot.repository.dynamodb

import com.amazonaws.services.dynamodbv2.document.spec.QuerySpec
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap
import com.amazonaws.services.dynamodbv2.document.{DynamoDB, Item}
import io.lambdaworks.knowledgebot.actor.model.{
  AssistantMessage,
  ChatMessage,
  Document,
  Feedback,
  Negative,
  Positive,
  UserMessage
}
import io.lambdaworks.knowledgebot.repository.Repository
import org.joda.time.DateTime

import scala.jdk.CollectionConverters._

class ChatMessageRepository(client: DynamoDB, tableName: String) extends Repository[ChatMessage] {

  def getAllForUserAndChat(userId: String, chatId: String): List[ChatMessage] = {
    val query = new QuerySpec()
      .withKeyConditionExpression("pk = :pk and begins_with(sk, :chatId)")
      .withValueMap(
        new ValueMap()
          .withString(":pk", s"USER#$userId")
          .withString(":chatId", s"MESSAGE#$chatId")
      )
      .withScanIndexForward(false)

    val response = table.query(query)

    val chats: List[ChatMessage] = response.iterator.asScala.map { it =>
      if (it.getString("role") == "User") {
        val feedbackOpt = it.getString("feedback")
        val feedback: Option[Feedback] = if (feedbackOpt != "NULL") {
          if (feedbackOpt == "Positive") Some(Positive) else Some(Negative)
        } else None
        UserMessage(
          it.getString("id"),
          it.getString("userId"),
          it.getString("chatId"),
          new DateTime(it.getString("createdAt")),
          it.getString("content"),
          feedback
        )
      } else {
        val docs = it
          .getList[java.util.LinkedHashMap[String, String]]("relevantDocuments")
          .asScala
          .toList
          .map(m => Document(m.get("source"), m.get("topic")))

        AssistantMessage(
          it.getString("id"),
          it.getString("userId"),
          it.getString("chatId"),
          new DateTime(it.getString("createdAt")),
          it.getString("content"),
          docs
        )
      }
    }.toList

    chats
  }

  def put(item: ChatMessage): Unit = {
    item match {
      case um: UserMessage =>
        val newItem = new Item()
          .withPrimaryKey(
            "pk",
            s"USER#${um.userId}",
            "sk",
            s"MESSAGE#${um.chatId}#${um.createdAt}"
          )
          .withString("id", um.id)
          .withString("userId", um.userId)
          .withString("chatId", um.chatId)
          .withString("createdAt", um.createdAt.toString())
          .withString("content", um.content)
          .withString("feedback", um.feedback.map(_.toString).getOrElse("NULL"))
          .withString("role", um.role.toString)

        table.putItem(newItem)

      case am: AssistantMessage =>
        val newItem = new Item()
          .withPrimaryKey(
            "pk",
            s"USER#${am.userId}",
            "sk",
            s"MESSAGE#${am.chatId}#${am.createdAt}"
          )
          .withString("id", am.id)
          .withString("userId", am.userId)
          .withString("chatId", am.chatId)
          .withString("createdAt", am.createdAt.toString())
          .withString("content", am.content)
          .withList(
            "relevantDocuments",
            am.relevantDocuments.map(d => Map("source" -> d.source, "topic" -> d.topic).asJava).asJava
          )
          .withString("role", am.role.toString)
        table.putItem(newItem)
    }
    ()
  }

  private val table = client.getTable(tableName)
}
