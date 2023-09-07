package io.lambdaworks.knowledgebot

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.adapter.ClassicActorSystemOps
import akka.actor.{ActorSystem => UntypedActorSystem, Props, Scheduler}
import akka.stream.Materializer
import akka.stream.scaladsl.{Merge, Source}
import com.amazonaws.regions.Regions
import com.amazonaws.services.dynamodbv2.document.DynamoDB
import com.amazonaws.services.dynamodbv2.{AmazonDynamoDB, AmazonDynamoDBClientBuilder}
import com.typesafe.config.{Config, ConfigFactory}
import io.lambdaworks.knowledgebot.actor.SlackMessageListenerActor
import io.lambdaworks.knowledgebot.actor.model.InteractionFeedback
import io.lambdaworks.knowledgebot.fetcher.DocumentFetcher
import io.lambdaworks.knowledgebot.fetcher.github.GitHubDocumentFetcher
import io.lambdaworks.knowledgebot.listener.ListenerService
import io.lambdaworks.knowledgebot.listener.github.GitHubPushListenerService
import io.lambdaworks.knowledgebot.repository.Repository
import io.lambdaworks.knowledgebot.repository.dynamodb.InteractionFeedbackRepository
import io.lambdaworks.knowledgebot.vectordb.VectorDatabase
import io.lambdaworks.knowledgebot.vectordb.qdrant.QdrantDatabase
import slack.rtm.SlackRtmClient

import scala.concurrent.ExecutionContextExecutor
import scala.concurrent.duration.DurationInt

object Main {
  val config: Config = ConfigFactory.load()

  implicit val system: UntypedActorSystem                 = UntypedActorSystem("KnowledgeBot")
  implicit val typedSystem: ActorSystem[Nothing]          = system.toTyped
  implicit val executionContext: ExecutionContextExecutor = typedSystem.executionContext
  implicit val materializer: Materializer                 = Materializer.matFromSystem(typedSystem)
  implicit val scheduler: Scheduler                       = system.scheduler

  val listenerService: ListenerService =
    new GitHubPushListenerService(
      config.getString("github.webhook.host"),
      config.getInt("github.webhook.port"),
      config.getString("github.webhook.secret")
    )

  val documentFetcher: DocumentFetcher =
    new GitHubDocumentFetcher(
      config.getString("github.token"),
      config.getString("github.user"),
      config.getString("github.repo"),
      config.getString("clickup.commonDocPath")
    )

  val vectorDatabase: VectorDatabase = new QdrantDatabase(
    config.getString("openai.apiKey"),
    config.getString("qdrant.clusterUrl"),
    config.getString("qdrant.apiKey"),
    config.getString("qdrant.collectionName")
  )

  val slackToken: String = config.getString("slack.token")

  val client: AmazonDynamoDB = AmazonDynamoDBClientBuilder
    .standard()
    .withRegion(Regions.EU_NORTH_1)
    .build()

  val dynamoDB: DynamoDB = new DynamoDB(client)

  val interactionFeedbackRepository: Repository[InteractionFeedback] =
    new InteractionFeedbackRepository(dynamoDB, config.getString("dynamodb.tableName"))

  def main(args: Array[String]): Unit = {
    Source
      .combine(Source.tick(0.seconds, 7.days, ()), listenerService.listen())(Merge(_))
      .mapAsync(1)(_ => documentFetcher.fetch())
      .runForeach(vectorDatabase.upsert)

    val client: SlackRtmClient = SlackRtmClient(slackToken)

    val slackMessageListenerActor =
      system.actorOf(Props(new SlackMessageListenerActor(client, interactionFeedbackRepository)))

    client.addEventListener(slackMessageListenerActor)
  }
}
