package io.lambdaworks.langchain.chains

import io.lambdaworks.langchain.chains.llm.LLMChain
import io.lambdaworks.langchain.chains.retrievalqa.base.RetrievalQA
import me.shadaj.scalapy.py

@py.native
trait ChainsModule extends py.Object {
  def LLMChain: LLMChain = py.native

  def RetrievalQA: RetrievalQA = py.native
}
