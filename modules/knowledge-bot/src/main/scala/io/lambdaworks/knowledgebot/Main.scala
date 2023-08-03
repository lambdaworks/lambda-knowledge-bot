package io.lambdaworks.knowledgebot

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.adapter.ClassicActorSystemOps
import akka.actor.{ActorSystem => UntypedActorSystem}
import akka.stream.Materializer
import akka.stream.scaladsl.{Merge, Sink, Source}
import com.typesafe.config.{Config, ConfigFactory}
import io.lambdaworks.knowledgebot.fetcher.DocumentFetcher
import io.lambdaworks.knowledgebot.fetcher.github.GitHubDocumentFetcher
import io.lambdaworks.knowledgebot.listener.ListenerService
import io.lambdaworks.knowledgebot.listener.github.GitHubPushListenerService
import io.lambdaworks.knowledgebot.retrieval.LLMRetriever
import io.lambdaworks.knowledgebot.retrieval.openai.GPTRetriever
import io.lambdaworks.knowledgebot.vectordb.VectorDatabase
import io.lambdaworks.knowledgebot.vectordb.qdrant.QdrantDatabase
import me.shadaj.scalapy.py
import slack.SlackUtil
import slack.rtm.SlackRtmClient

import scala.concurrent.{ExecutionContextExecutor, Future}
import scala.util.Success

object Main {
  val config: Config = ConfigFactory.load()

  implicit val system: UntypedActorSystem                 = UntypedActorSystem("KnowledgeBot")
  implicit val typedSystem: ActorSystem[Nothing]          = system.toTyped
  implicit val executionContext: ExecutionContextExecutor = typedSystem.executionContext
  implicit val materializer: Materializer                 = Materializer.matFromSystem(typedSystem)

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

  val retriever: LLMRetriever = new GPTRetriever(vectorDatabase.asRetriever)

  val slackToken: String = config.getString("slack.token")

  def embedSlackLink(link: String, text: String): String =
    s"<$link|$text>"

  def createSlackMessage(llmResponse: py.Dynamic): String = {
    val result = llmResponse.bracketAccess("result").as[String]

    val sources = Option(llmResponse.bracketAccess("source_documents").as[List[py.Dynamic]])
      .filter(_.nonEmpty)
      .map { documents =>
        "\n\n" + "*Relevant documents:* " + documents.map { doc =>
          embedSlackLink(
            doc.metadata.bracketAccess("source").as[String],
            doc.metadata.bracketAccess("topic").as[String]
          )
        }.distinct.mkString(", ")
      }
      .getOrElse("")

    result + sources
  }

  def main(args: Array[String]): Unit = {
    Source
      .combine(Source.single(()), listenerService.listen())(Merge(_))
      .mapAsync(1)(_ => documentFetcher.fetch())
      .runWith(Sink.foreach(vectorDatabase.upsert))

    val client: SlackRtmClient = SlackRtmClient(slackToken)

    val clientId = client.state.self.id

    client.onMessage { message =>
      if (SlackUtil.isDirectMsg(message) && message.user.exists(_ != clientId) && message.bot_id.isEmpty) {
        Future
          .sequence(
            List(
              Future(
                client.apiClient.postChatMessage(message.channel, "*Generating response...*", unfurlLinks = Some(false))
              ),
              Future(createSlackMessage(retriever.retrieve(message.text)))
            )
          )
          .onComplete { case Success(List(timestamp, newMessage)) =>
            client.apiClient.updateChatMessage(message.channel, timestamp, newMessage)
          }
      }
    }
  }
}
