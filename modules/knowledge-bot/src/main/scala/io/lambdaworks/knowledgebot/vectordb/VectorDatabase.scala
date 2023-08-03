package io.lambdaworks.knowledgebot.vectordb

import io.lambdaworks.knowledgebot.fetcher.Document
import me.shadaj.scalapy.py

trait VectorDatabase {
  def asRetriever: py.Dynamic
  def upsert(documents: List[Document]): Unit
}
