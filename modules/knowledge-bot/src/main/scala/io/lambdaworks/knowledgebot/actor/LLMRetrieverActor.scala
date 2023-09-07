package io.lambdaworks.knowledgebot.actor

import akka.actor.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import io.lambdaworks.knowledgebot.retrieval.LLMRetriever

import scala.concurrent.ExecutionContext

object LLMRetrieverActor {
  final case class Request(input: String)

  def apply(
    parent: ActorRef[SlackKnowledgeBotActor.Event],
    retriever: LLMRetriever
  )(implicit actorSystem: ActorSystem, executionContext: ExecutionContext): Behavior[Request] =
    Behaviors.receiveMessage { request =>
      parent ! SlackKnowledgeBotActor.LLMResponse(retriever.retrieve(request.input))

      Behaviors.same
    }
}
