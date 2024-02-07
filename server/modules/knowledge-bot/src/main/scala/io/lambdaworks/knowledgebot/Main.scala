package io.lambdaworks.knowledgebot

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.adapter.ClassicActorSystemOps
import akka.actor.{ActorSystem => UntypedActorSystem, Props, Scheduler}
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.directives.RouteDirectives
import akka.stream.Materializer
import akka.stream.scaladsl.{Merge, Source}
import com.amazonaws.services.dynamodbv2.document.DynamoDB
import com.amazonaws.services.dynamodbv2.{AmazonDynamoDB, AmazonDynamoDBClientBuilder}
import com.typesafe.config.{Config, ConfigFactory}
import io.lambdaworks.knowledgebot.actor.MessageRouterActor
import io.lambdaworks.knowledgebot.actor.model.InteractionFeedback
import io.lambdaworks.knowledgebot.actor.slack.SlackMessageListenerActor
import io.lambdaworks.knowledgebot.api.route.ChatRoutes
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
import scala.util.Try

object Main {
  val config: Config = ConfigFactory.load()

  val system: UntypedActorSystem                          = UntypedActorSystem("KnowledgeBot")
  implicit val typedSystem: ActorSystem[Nothing]          = system.toTyped
  implicit val executionContext: ExecutionContextExecutor = typedSystem.executionContext
  implicit val materializer: Materializer                 = Materializer.matFromSystem(typedSystem)
  implicit val scheduler: Scheduler                       = system.scheduler

  val listenerService: Option[ListenerService] =
    Try {
      new GitHubPushListenerService(
        config.getString("github.webhook.host"),
        config.getInt("github.webhook.port"),
        config.getString("github.webhook.secret")
      )
    }.toOption

  val documentFetcher: Option[DocumentFetcher] =
    Try {
      new GitHubDocumentFetcher(
        config.getString("github.token"),
        config.getString("github.user"),
        config.getString("github.repo"),
        config.getString("clickup.commonDocUrl")
      )
    }.toOption

  val vectorDatabase: VectorDatabase = new QdrantDatabase(
    config.getString("openai.apiKey"),
    config.getString("qdrant.clusterUrl"),
    config.getString("qdrant.apiKey"),
    config.getString("qdrant.collectionName")
  )

  val slackToken: Option[String] = Try(config.getString("slack.token")).toOption

  val client: AmazonDynamoDB = AmazonDynamoDBClientBuilder
    .standard()
    .withRegion(config.getString("dynamodb.region"))
    .build()

  val dynamoDB: DynamoDB = new DynamoDB(client)

  val interactionFeedbackRepository: Repository[InteractionFeedback] =
    new InteractionFeedbackRepository(dynamoDB, config.getString("dynamodb.tableName"))

  def main(args: Array[String]): Unit = {
    listenerService.foreach { listenerService =>
      Source
        .combine(Source.single(()), listenerService.listenSource)(Merge(_))
        .mapAsync(1)(_ => documentFetcher.get.fetch())
        .runForeach(vectorDatabase.upsert)
        .onComplete(_ => typedSystem.terminate())
    }

    slackToken.foreach { slackToken =>
      val client: SlackRtmClient = SlackRtmClient(slackToken)(system)

      val slackMessageListenerActor =
        system.actorOf(Props(new SlackMessageListenerActor(client, interactionFeedbackRepository)))

      client.addEventListener(slackMessageListenerActor)
    }

    val messageRouterActor = system.spawn(MessageRouterActor(), "MessageRouterActor")

    val serverRoutes =
      new ChatRoutes(messageRouterActor).chatRoutes ~ listenerService.fold[Route](RouteDirectives.reject)(_.routes)

    Http()
      .newServerAt(config.getString("api.host"), config.getInt("api.port"))
      .bind(serverRoutes)
      .map(_.addToCoordinatedShutdown(hardTerminationDeadline = 10.seconds))
  }
}
