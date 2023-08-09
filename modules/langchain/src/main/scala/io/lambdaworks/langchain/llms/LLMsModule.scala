package io.lambdaworks.langchain.llms

import me.shadaj.scalapy.py

@py.native
trait LLMsModule extends py.Module {
  def OpenAI: OpenAI = py.native
}
