package io.lambdaworks.knowledgebot.vectordb

import io.lambdaworks.knowledgebot.fetcher.Document
import io.lambdaworks.langchain.schema.retriever.BaseRetriever

trait VectorDatabase {
  def asRetriever: BaseRetriever
  def upsert(documents: List[Document]): Unit
}
