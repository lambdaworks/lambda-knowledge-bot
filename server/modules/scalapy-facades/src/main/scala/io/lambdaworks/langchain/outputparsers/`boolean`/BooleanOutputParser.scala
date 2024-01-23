package io.lambdaworks.langchain.outputparsers.`boolean`

import io.lambdaworks.langchain.schema.outputparser.BaseLLMOutputParser
import me.shadaj.scalapy.py

@py.native
trait BooleanOutputParser extends BaseLLMOutputParser {
  def apply(): BooleanOutputParser = as[py.Dynamic].applyNamed().as[BooleanOutputParser]
}
