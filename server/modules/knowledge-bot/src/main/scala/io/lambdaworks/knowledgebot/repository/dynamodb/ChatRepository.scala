package io.lambdaworks.knowledgebot.repository.dynamodb

import com.amazonaws.services.dynamodbv2.document.spec.QuerySpec
import com.amazonaws.services.dynamodbv2.document.utils.ValueMap
import com.amazonaws.services.dynamodbv2.document.{DynamoDB, Item}
import io.lambdaworks.knowledgebot.actor.model.Chat
import io.lambdaworks.knowledgebot.repository.Repository
import org.joda.time.DateTime

import scala.jdk.CollectionConverters._

class ChatRepository(client: DynamoDB, tableName: String) extends Repository[Chat] {

  def get(userId: String, id: String): Option[Chat] = {
    val query = new QuerySpec()
      .withKeyConditionExpression("pk = :pk and id = :id")
      .withValueMap(
        new ValueMap()
          .withString(":pk", s"USER#$userId")
          .withString(":id", id)
      )

    val index    = table.getIndex("userId-id")
    val response = index.query(query)

    val chats: List[Chat] = response.iterator.asScala.map { it =>
      Chat(it.getString("id"), it.getString("userId"), it.getString("title"), new DateTime(it.getString("createdAt")))
    }.toList

    chats.headOption
  }

  def getAllForUser(userId: String, limit: Int, lastKey: Option[String] = None): List[Chat] = {
    val query = new QuerySpec()
      .withKeyConditionExpression("pk = :pk and begins_with(sk, :chat)")
      .withValueMap(
        new ValueMap()
          .withString(":pk", s"USER#$userId")
          .withString(":chat", "CHAT#")
      )
      .withMaxResultSize(limit)
      .withScanIndexForward(false)

    val page = lastKey.fold(query) { lk =>
      query.withExclusiveStartKey(
        "pk",
        s"USER#$userId",
        "sk",
        s"CHAT#$lk"
      )
    }

    val response = table.query(page)

    val chats: List[Chat] = response.iterator.asScala.map { it =>
      Chat(it.getString("id"), it.getString("userId"), it.getString("title"), new DateTime(it.getString("createdAt")))
    }.toList

    chats
  }

  def put(item: Chat): Unit = {
    val newItem = new Item()
      .withPrimaryKey(
        "pk",
        s"USER#${item.userId}",
        "sk",
        s"CHAT#${item.createdAt}"
      )
      .withString("id", item.id)
      .withString("userId", item.userId)
      .withString("title", item.title)
      .withString("createdAt", item.createdAt.toString())

    table.putItem(newItem)

    ()
  }

  private val table = client.getTable(tableName)
}
