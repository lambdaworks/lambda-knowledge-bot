import BuildHelper._

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
    .aggregate(langchain, knowledgeBot)
    .settings(name := "lambda-knowledge-bot")

lazy val langchain =
  project
    .in(file("modules/langchain"))
    .settings(
      stdSettings("langchain"),
      libraryDependencies ++= Seq(
        "dev.scalapy" %% "scalapy-core"       % "0.5.3",
        "ai.kien"     %% "python-native-libs" % "0.2.4"
      )
    )

lazy val knowledgeBot =
  project
    .in(file("modules/knowledge-bot"))
    .settings(
      stdSettings("knowledgeBot"),
      libraryDependencies ++= Seq(
        "com.typesafe.akka"             %% "akka-actor-typed"     % "2.8.0",
        "com.typesafe.akka"             %% "akka-stream"          % "2.8.0",
        "com.typesafe.akka"             %% "akka-http"            % "10.5.2",
        "com.typesafe.akka"             %% "akka-http-spray-json" % "10.5.2",
        "com.typesafe"                   % "config"               % "1.4.2",
        "org.slf4j"                      % "slf4j-simple"         % "2.0.5",
        "com.github.slack-scala-client" %% "slack-scala-client"   % "0.4.3",
        "commons-codec"                  % "commons-codec"        % "1.15"
      )
    )
    .dependsOn(langchain)
