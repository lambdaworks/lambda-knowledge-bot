import sbt._
import Keys._
import scalafix.sbt.ScalafixPlugin.autoImport._

object BuildHelper {
  def stdSettings(prjName: String) =
    Seq(
      name              := s"$prjName",
      scalacOptions     := stdOptions,
      semanticdbEnabled := true, // enable SemanticDB
      semanticdbOptions += "-P:semanticdb:synthetics:on",
      semanticdbVersion                      := scalafixSemanticdb.revision,
      ThisBuild / scalafixScalaBinaryVersion := CrossVersion.binaryScalaVersion(scalaVersion.value)
    )

  private val stdOptions = List(
    "-deprecation",
    "-encoding",
    "UTF-8",
    "-feature",
    "-unchecked",
    "-language:higherKinds",
    "-language:existentials",
    "-explaintypes",
    "-Yrangepos",
    "-Xlint:_,-missing-interpolator,-type-parameter-shadow",
    "-Ywarn-numeric-widen",
    "-Ywarn-value-discard",
    "-Ywarn-unused:params,-implicits"
  )
}
