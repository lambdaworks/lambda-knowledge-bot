package io.lambdaworks.knowledgebot.listener.github

import akka.NotUsed
import akka.actor.typed.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.{HttpHeader, StatusCodes}
import akka.http.scaladsl.server.Directives.{complete, extractDataBytes, headerValue, onComplete, path, post, validate}
import akka.http.scaladsl.server.Route
import akka.stream.scaladsl.Source
import io.lambdaworks.knowledgebot.listener.ListenerService
import org.apache.commons.codec.digest.HmacUtils

import scala.concurrent.{ExecutionContext, Future}

final class GitHubPushListenerService(host: String, port: Int, secret: String) extends ListenerService {
  def listen()(implicit ec: ExecutionContext, system: ActorSystem[Nothing]): Source[Unit, NotUsed] = {
    val (queue, source) = Source.queue[Unit](1).preMaterialize()

    val postRoute: Route = headerValue(extractSignature) { signature =>
      extractDataBytes { data =>
        val byteArrayFuture = data.runFold(Array.empty[Byte])((acc, byteString) => acc ++ byteString.toArray)
        onComplete(byteArrayFuture) { byteArrayTry =>
          val calculatedSignatureTry = byteArrayTry.map("sha256=" + hmacUtils.hmacHex(_))
          validate(calculatedSignatureTry.filter(_ == signature).isSuccess, "Signatures don't match") {
            complete {
              queue.offer(())
              StatusCodes.OK
            }
          }
        }
      }
    }

    val route =
      path("payload") {
        post {
          postRoute
        }
      }

    Http().newServerAt(host, port).bind(route)

    source
  }

  private def extractSignature: HttpHeader => Option[String] = {
    case h if h.name() == "X-Hub-Signature-256" => Some(h.value())
    case _                                      => None
  }

  private val hmacUtils: HmacUtils = new HmacUtils("HmacSHA256", secret)
}
