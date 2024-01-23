package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import io.lambdaworks.knowledgebot.retrieval.LLMRetriever
import me.shadaj.scalapy.py

object LLMRetrieverActor {
  final case class Request(input: String)
  final case class Response(response: Map[String, py.Any])

  def apply(
    parent: ActorRef[Response],
    retriever: LLMRetriever
  ): Behavior[Request] =
    Behaviors.receiveMessage { request =>
      parent ! Response(retriever.retrieve(request.input))

      Behaviors.same
    }
}
