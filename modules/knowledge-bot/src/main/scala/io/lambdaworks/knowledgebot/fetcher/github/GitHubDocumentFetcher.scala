package io.lambdaworks.knowledgebot.fetcher.github

import akka.actor.typed.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.model.headers.{Authorization, OAuth2BearerToken}
import akka.http.scaladsl.model.{HttpRequest, Uri}
import akka.http.scaladsl.unmarshalling.Unmarshal
import io.lambdaworks.knowledgebot.fetcher.{Document, DocumentFetcher}

import java.nio.charset.StandardCharsets
import java.util.Base64
import scala.concurrent.{ExecutionContext, Future}

final class GitHubDocumentFetcher(token: String, user: String, repo: String, commonDocUrl: String)
    extends DocumentFetcher
    with GitHubFileJsonProtocol {
  def fetch()(implicit ec: ExecutionContext, system: ActorSystem[Nothing]): Future[List[Document]] = {
    val filesFuture: Future[List[GitHubFile]] = for {
      response  <- Http().singleRequest(request)
      fileInfos <- Unmarshal(response.entity).to[List[GitHubFileInfo]]
      files <- Future.sequence(fileInfos.map { fileInfo =>
                 val request = HttpRequest(
                   headers = Seq(authHeader),
                   uri = Uri(fileInfo.url)
                 )

                 Http().singleRequest(request).flatMap(response => Unmarshal(response.entity).to[GitHubFile])
               })
    } yield files

    filesFuture.map { files =>
      files.map { file =>
        Document(
          file.name match {
            case pattern(rootId, id) => commonDocUrl + rootId + '/' + commonDocUrl.split('/').last + id
            case _                   => ""
          },
          new String(Base64.getDecoder.decode(file.content.replace("\n", "")), StandardCharsets.UTF_8)
        )
      }
    }
  }

  private val authHeader = Authorization(OAuth2BearerToken(token))

  private val request =
    HttpRequest(headers = Seq(authHeader), uri = Uri(s"https://api.github.com/repos/$user/$repo/contents"))

  private val pattern = "^.*_([0-9]+)_([0-9]+)\\..*$".r
}
