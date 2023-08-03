package io.lambdaworks.knowledgebot.retrieval.openai

import io.lambdaworks.knowledgebot.retrieval.LLMRetriever
import me.shadaj.scalapy.py

class GPTRetriever(retriever: py.Any) extends LLMRetriever {
  def retrieve(query: String): py.Dynamic =
    qaChain(query)

  private val chains     = py.module("langchain.chains")
  private val chatModels = py.module("langchain.chat_models")

  private val llm = chatModels.ChatOpenAI(model_name = "gpt-3.5-turbo", temperature = 0)

  private val qaChain = chains.RetrievalQA.from_chain_type(llm, retriever = retriever, return_source_documents = true)
}
