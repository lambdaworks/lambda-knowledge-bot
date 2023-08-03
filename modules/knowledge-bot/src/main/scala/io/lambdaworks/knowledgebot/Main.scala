package io.lambdaworks.knowledgebot

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import akka.stream.scaladsl.Sink
import io.lambdaworks.knowledgebot.fetcher.DocumentFetcher
import io.lambdaworks.knowledgebot.fetcher.github.GitHubDocumentFetcher
import io.lambdaworks.knowledgebot.listener.ListenerService
import io.lambdaworks.knowledgebot.listener.github.GitHubPushListenerService

import scala.concurrent.ExecutionContextExecutor

object Main {
  implicit val system: ActorSystem[Nothing]               = ActorSystem(Behaviors.empty, "SingleRequest")
  implicit val executionContext: ExecutionContextExecutor = system.executionContext

  lazy val listenerService: ListenerService = GitHubPushListenerService
  lazy val documentFetcher: DocumentFetcher = new GitHubDocumentFetcher("", "", "")

  def main(args: Array[String]): Unit =
    listenerService.listen().runWith(Sink.foreach(_ => println("yikes")))
}
