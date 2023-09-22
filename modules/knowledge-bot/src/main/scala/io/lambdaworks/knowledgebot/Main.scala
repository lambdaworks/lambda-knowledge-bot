package io.lambdaworks.knowledgebot

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.adapter.ClassicActorSystemOps
import akka.actor.{ActorSystem => UntypedActorSystem, Props, Scheduler}
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{complete, get, path}
import akka.stream.Materializer
import akka.stream.scaladsl.{Merge, Source}
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

  val system: UntypedActorSystem                          = UntypedActorSystem("KnowledgeBot")
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
      config.getString("clickup.commonDocUrl")
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
    .withRegion(config.getString("dynamodb.region"))
    .build()

  val dynamoDB: DynamoDB = new DynamoDB(client)

  val interactionFeedbackRepository: Repository[InteractionFeedback] =
    new InteractionFeedbackRepository(dynamoDB, config.getString("dynamodb.tableName"))

  val healthcheckHost: String = config.getString("healthcheck.host")
  val healthcheckPort: Int    = config.getInt("healthcheck.port")

  def main(args: Array[String]): Unit = {
    Source
      .combine(Source.single(()), listenerService.listen())(Merge(_))
      .mapAsync(1)(_ => documentFetcher.fetch())
      .runForeach(vectorDatabase.upsert)
      .onComplete(_ => typedSystem.terminate())

    val client: SlackRtmClient = SlackRtmClient(slackToken)(system)

    val slackMessageListenerActor =
      system.actorOf(Props(new SlackMessageListenerActor(client, interactionFeedbackRepository)))

    client.addEventListener(slackMessageListenerActor)

    Http()
      .newServerAt(healthcheckHost, healthcheckPort)
      .bind(path("health")(get(complete(StatusCodes.OK))))
      .map(_.addToCoordinatedShutdown(hardTerminationDeadline = 10.seconds))
  }
}
