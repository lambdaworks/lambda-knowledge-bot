package io.lambdaworks.knowledgebot.repository.dynamodb

import com.amazonaws.services.dynamodbv2.document.{DynamoDB, Item}
import io.lambdaworks.knowledgebot.actor.model.slack.InteractionFeedback
import io.lambdaworks.knowledgebot.repository.Repository

class InteractionFeedbackRepository(client: DynamoDB, tableName: String) extends Repository[InteractionFeedback] {
  def put(item: InteractionFeedback): Unit = {
    val newItem = new Item()
      .withPrimaryKey(
        "Channel",
        item.interaction.id.channel,
        "Timestamp",
        BigInt(item.interaction.id.timestamp.replace(".", ""))
      )
      .withString("Input", item.interaction.input)
      .withString("Output", item.interaction.response)
      .withString("Feedback", item.feedback.toString.toUpperCase)

    table.putItem(newItem)

    ()
  }

  private val table = client.getTable(tableName)
}
