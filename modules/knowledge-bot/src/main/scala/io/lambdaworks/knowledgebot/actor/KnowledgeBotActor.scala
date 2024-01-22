package io.lambdaworks.knowledgebot.actor

import akka.actor.typed.scaladsl.Behaviors
import akka.actor.typed.{ActorRef, ActorSystem, Behavior}
import akka.stream.BoundedSourceQueue
import akka.stream.scaladsl.Source
import io.lambdaworks.knowledgebot.Main
import io.lambdaworks.knowledgebot.actor.KnowledgeBotActor.{
  ApiResponse,
  ChatMessage,
  Document,
  Event,
  InactivityTimeout,
  LLMResponse,
  NewToken
}
import io.lambdaworks.knowledgebot.retrieval.openai.GPTRetriever
import io.lambdaworks.langchain.schema.document.{Document => LangchainDocument}
import me.shadaj.scalapy.py

import scala.concurrent.duration.DurationInt

object KnowledgeBotActor {
  sealed trait Event
  final case class ChatMessage(text: String, replyBack: ActorRef[Source[(ApiResponse, String), _]]) extends Event
  private final case class NewToken(text: String)                                                   extends Event
  private final case class LLMResponse(response: Map[String, py.Any])                               extends Event
  private final case object InactivityTimeout                                                       extends Event

  final case class Document(source: String, topic: String)
  final case class ApiResponse(
    messageToken: String,
    jwtToken: Option[String],
    relevantDocuments: Option[List[Document]]
  )

  def apply(session: String, routerActor: ActorRef[MessageRouterActor.Event])(implicit
    system: ActorSystem[_]
  ): Behavior[Event] =
    Behaviors.setup { context =>
      context.setReceiveTimeout(10.minutes, InactivityTimeout)

      val replyBack = context.messageAdapter[LLMRetrieverActor.Response](response => LLMResponse(response.response))

      val retriever      = new GPTRetriever(Main.vectorDatabase.asRetriever, context.self ! NewToken(_))
      val retrieverActor = context.spawn(LLMRetrieverActor(replyBack, retriever), "LLMRetrieverActor")

      new KnowledgeBotActor(session, routerActor, retrieverActor).acceptMessage()
    }
}

private final class KnowledgeBotActor(
  session: String,
  routerActor: ActorRef[MessageRouterActor.Event],
  retrieverActor: ActorRef[LLMRetrieverActor.Request]
)(implicit val system: ActorSystem[_]) {
  private def acceptMessage(): Behavior[Event] =
    Behaviors.receiveMessage {
      case ChatMessage(text, replyBack) =>
        val (queue, source) = Source.queue[(ApiResponse, String)](1).preMaterialize()

        replyBack ! source

        retrieverActor ! LLMRetrieverActor.Request(text)

        processTokens(queue)
      case InactivityTimeout =>
        routerActor ! MessageRouterActor.SessionExpired(session)

        Behaviors.stopped
    }

  private def processTokens(queue: BoundedSourceQueue[(ApiResponse, String)]): Behavior[Event] =
    Behaviors.receiveMessage {
      case _: ChatMessage =>
        Behaviors.same
      case NewToken(text) =>
        queue.offer((ApiResponse(messageToken = text, None, None), "in_progress"))

        Behaviors.same
      case LLMResponse(response) =>
        queue.offer(
          (
            ApiResponse(
              messageToken = "",
              relevantDocuments = Some(
                response("source_documents")
                  .as[List[LangchainDocument]]
                  .map(d => Document(source = d.metadata("source"), topic = d.metadata("topic")))
              ),
              jwtToken = None
            ),
            "finish"
          )
        )

        acceptMessage()
      case InactivityTimeout =>
        routerActor ! MessageRouterActor.SessionExpired(session)

        Behaviors.stopped
    }
}
