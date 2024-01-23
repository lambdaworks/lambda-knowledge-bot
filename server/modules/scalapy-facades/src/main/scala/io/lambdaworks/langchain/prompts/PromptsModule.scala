package io.lambdaworks.langchain.prompts

import io.lambdaworks.langchain.prompts.prompt.PromptTemplate
import me.shadaj.scalapy.py

@py.native
object PromptsModule extends py.StaticModule("langchain.prompts") {
  def PromptTemplate: PromptTemplate = py.native
}
