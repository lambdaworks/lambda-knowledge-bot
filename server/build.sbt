import BuildHelper._
import com.typesafe.sbt.packager.docker._

Global / onChangedBuildSource := ReloadOnSourceChanges

inThisBuild(
  Seq(
    scalaVersion     := "2.13.11",
    organization     := "io.lambdaworks",
    organizationName := "LambdaWorks",
    fork             := true,
    javaOptions ++= javaOpts
  )
)

addCommandAlias("check", "fixCheck; fmtCheck")
addCommandAlias("fix", "scalafixAll")
addCommandAlias("fixCheck", "scalafixAll --check")
addCommandAlias("fmt", "all scalafmtSbt scalafmtAll")
addCommandAlias("fmtCheck", "all scalafmtSbtCheck scalafmtCheckAll")
addCommandAlias("prepare", "fix; fmt")

lazy val root =
  project
    .in(file("."))
    .aggregate(scalaPyFacades, knowledgeBot)
    .settings(name := "lambda-knowledge-bot")

lazy val scalaPyFacades =
  project
    .in(file("modules/scalapy-facades"))
    .settings(
      stdSettings("scalapy-facades"),
      libraryDependencies ++= Seq(
        "dev.scalapy" %% "scalapy-core"       % "0.5.3",
        "ai.kien"     %% "python-native-libs" % "0.2.4"
      )
    )

lazy val knowledgeBot =
  project
    .in(file("modules/knowledge-bot"))
    .enablePlugins(JavaAppPackaging)
    .enablePlugins(DockerPlugin)
    .settings(
      stdSettings("knowledgeBot"),
      libraryDependencies ++= Seq(
        "com.amazonaws"                  % "aws-java-sdk-dynamodb" % "1.12.472",
        "com.typesafe.akka"             %% "akka-actor-typed"      % "2.8.0",
        "com.typesafe.akka"             %% "akka-stream-typed"     % "2.8.0",
        "com.typesafe.akka"             %% "akka-http"             % "10.5.2",
        "com.typesafe.akka"             %% "akka-http-spray-json"  % "10.5.2",
        "com.typesafe"                   % "config"                % "1.4.2",
        "org.slf4j"                      % "slf4j-simple"          % "2.0.5",
        "com.github.slack-scala-client" %% "slack-scala-client"    % "0.4.3",
        "commons-codec"                  % "commons-codec"         % "1.15"
      ),
      Universal / mappings += file("requirements.txt") -> "requirements.txt",
      dockerAlias                                      := new DockerAlias(None, None, "lambda-knowledge-bot", None),
      dockerBaseImage                                  := "eclipse-temurin:8-jre-jammy",
      dockerExposedPorts ++= Seq(80, 8080),
      dockerCommands := {
        dockerCommands.value
          .patch(
            dockerCommands.value.length - 3,
            Seq(
              Cmd("RUN", "apt-get update".split(' '): _*),
              Cmd("RUN", "apt-get install -y python3".split(' '): _*),
              Cmd("RUN", "apt-get install -y python3-pip".split(' '): _*),
              Cmd("RUN", "pip3 install --no-cache --upgrade pip setuptools".split(' '): _*),
              Cmd("RUN", "pip3 install --no-cache-dir -r requirements.txt".split(' '): _*)
            ),
            0
          )
      }
    )
    .dependsOn(scalaPyFacades)
