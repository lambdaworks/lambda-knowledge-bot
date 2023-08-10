package io.lambdaworks.langchain.outputparsers

import io.lambdaworks.langchain.outputparsers.`boolean`.BooleanOutputParser
import me.shadaj.scalapy.py

@py.native
object OutputParsersModule extends py.StaticModule("langchain.output_parsers") {
  def BooleanOutputParser: BooleanOutputParser = py.native
}
