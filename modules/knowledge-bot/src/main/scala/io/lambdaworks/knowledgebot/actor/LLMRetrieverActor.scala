package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, Behavior}
import io.lambdaworks.knowledgebot.retrieval.LLMRetriever

object LLMRetrieverActor {
  final case class Request(input: String)

  def apply(
    parent: ActorRef[SlackKnowledgeBotActor.Event],
    retriever: LLMRetriever
  ): Behavior[Request] =
    Behaviors.receiveMessage { request =>
      parent ! SlackKnowledgeBotActor.LLMResponse(retriever.retrieve(request.input))

      Behaviors.same
    }
}
