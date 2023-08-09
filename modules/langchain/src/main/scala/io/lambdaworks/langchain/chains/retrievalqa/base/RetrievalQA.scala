package io.lambdaworks.langchain.chains.retrievalqa.base

import io.lambdaworks.langchain.chains.base.Chain
import io.lambdaworks.langchain.prompts.PromptTemplate
import io.lambdaworks.langchain.schema.languagemodel.BaseLanguageModel
import io.lambdaworks.langchain.schema.retriever.BaseRetriever
import me.shadaj.scalapy.py

@py.native
trait RetrievalQA extends Chain {
  def fromChainType(
    llm: BaseLanguageModel,
    prompt: PromptTemplate,
    retriever: BaseRetriever,
    returnSourceDocuments: Boolean
  ): RetrievalQA =
    as[py.Dynamic]
      .from_chain_type(
        llm = llm,
        retriever = retriever,
        return_source_documents = returnSourceDocuments,
        chain_type_kwargs = Map("prompt" -> prompt)
      )
      .as[RetrievalQA]
}
