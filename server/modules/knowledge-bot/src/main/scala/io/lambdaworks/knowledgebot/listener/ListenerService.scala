package io.lambdaworks.knowledgebot.listener

import akka.NotUsed
import akka.http.scaladsl.server.Route
import akka.stream.scaladsl.Source

trait ListenerService {
  def listenSource: Source[Unit, NotUsed]
  def routes: Route
}
