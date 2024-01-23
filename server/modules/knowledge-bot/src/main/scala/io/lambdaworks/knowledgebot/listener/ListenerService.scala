package io.lambdaworks.knowledgebot.listener

import akka.NotUsed
import akka.actor.typed.ActorSystem
import akka.stream.scaladsl.Source

import scala.concurrent.ExecutionContext

trait ListenerService {
  def listen()(implicit ec: ExecutionContext, system: ActorSystem[Nothing]): Source[Unit, NotUsed]
}
