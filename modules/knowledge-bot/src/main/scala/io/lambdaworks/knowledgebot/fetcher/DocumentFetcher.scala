package io.lambdaworks.knowledgebot.fetcher

import akka.actor.typed.ActorSystem

import scala.concurrent.{ExecutionContext, Future}

trait DocumentFetcher {
  def fetch()(implicit ec: ExecutionContext, system: ActorSystem[Nothing]): Future[List[Document]]
}
