import sbt._
import Keys._
import scalafix.sbt.ScalafixPlugin.autoImport._
import ai.kien.python.Python

object BuildHelper {
  private lazy val python = Python()

  lazy val javaOpts = python.scalapyProperties.get.map {
    case (k, v) => s"""-D$k=$v"""
  }.toSeq

  def stdSettings(prjName: String) =
    Seq(
      name              := s"$prjName",
      ThisBuild / scalaVersion := "2.13.11",
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
