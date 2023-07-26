package io.lambdaworks.application

import ai.kien.python.Python

object Main {
  def setScalapyProperties(): Unit =
    Python().scalapyProperties.fold(
      ex => println(s"Error while getting ScalaPy properties: $ex"),
      props => props.foreach { case (k, v) => System.setProperty(k, v) }
    )

  def main(args: Array[String]): Unit =
    setScalapyProperties()
}
