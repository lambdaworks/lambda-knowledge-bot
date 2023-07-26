import BuildHelper._

Global / onChangedBuildSource := ReloadOnSourceChanges

inThisBuild(
  Seq(
    scalaVersion     := "2.13.11",
    organization     := "io.lambdaworks",
    organizationName := "LambdaWorks",
    fork := true,
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
    .aggregate(langchain, application)
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

lazy val application =
  project
    .in(file("modules/application"))
    .settings(
      stdSettings("application")
    )
    .dependsOn(langchain)
