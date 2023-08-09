package io.lambdaworks.langchain

import io.lambdaworks.langchain.chains.ChainsModule
import io.lambdaworks.langchain.chains.llm.LLMChain
import io.lambdaworks.langchain.chatmodels.ChatModelsModule
import io.lambdaworks.langchain.embeddings.EmbeddingsModule
import io.lambdaworks.langchain.llms.LLMsModule
import io.lambdaworks.langchain.outputparsers.OutputParsersModule
import io.lambdaworks.langchain.prompts.PromptTemplate
import io.lambdaworks.langchain.textsplitter.TextSplitterModule
import io.lambdaworks.langchain.vectorstores.VectorStoresModule
import me.shadaj.scalapy.py

@py.native
trait LangChainModule extends py.Object {
  def chains: ChainsModule = py.native

  def chatModels: ChatModelsModule = as[py.Dynamic].chat_models.as[ChatModelsModule]

  def embeddings: EmbeddingsModule = py.native

  def LLMChain: LLMChain = py.native

  def llms: LLMsModule = py.native

  def outputParsers: OutputParsersModule = as[py.Dynamic].output_parsers.as[OutputParsersModule]

  def PromptTemplate: PromptTemplate = py.native

  def textSplitter: TextSplitterModule = as[py.Dynamic].text_splitter.as[TextSplitterModule]

  def vectorstores: VectorStoresModule = py.native
}
