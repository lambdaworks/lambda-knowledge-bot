package io.lambdaworks.langchain

import io.lambdaworks.langchain.chains.llm.LLMChain
import io.lambdaworks.langchain.prompts.prompt.PromptTemplate
import me.shadaj.scalapy.py

@py.native
object LangChainModule extends py.StaticModule("langchain") {
  def LLMChain: LLMChain = py.native

  def PromptTemplate: PromptTemplate = py.native
}
