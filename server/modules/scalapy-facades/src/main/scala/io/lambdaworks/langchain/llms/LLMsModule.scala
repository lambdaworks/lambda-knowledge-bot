package io.lambdaworks.langchain.llms

import io.lambdaworks.langchain.llms.openai.OpenAI
import me.shadaj.scalapy.py

@py.native
object LLMsModule extends py.StaticModule("langchain.llms") {
  def OpenAI: OpenAI = py.native
}
