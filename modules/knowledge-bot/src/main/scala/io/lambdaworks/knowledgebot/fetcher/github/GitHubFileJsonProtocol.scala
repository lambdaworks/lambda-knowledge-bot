package io.lambdaworks.knowledgebot.fetcher.github

import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport
import spray.json.{DefaultJsonProtocol, RootJsonFormat}

trait GitHubFileJsonProtocol extends DefaultJsonProtocol with SprayJsonSupport {
  implicit val gitHubFileInfoFormat: RootJsonFormat[GitHubFileInfo] = jsonFormat1(GitHubFileInfo)
  implicit val gitHubFileFormat: RootJsonFormat[GitHubFile]         = jsonFormat2(GitHubFile)
}
