package io.lambdaworks.langchain.outputparsers

import me.shadaj.scalapy.py

@py.native
trait OutputParsersModule extends py.Object {
  def BooleanOutputParser: BooleanOutputParser = py.native
}
