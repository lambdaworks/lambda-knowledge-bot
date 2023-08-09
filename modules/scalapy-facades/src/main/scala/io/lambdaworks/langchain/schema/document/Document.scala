package io.lambdaworks.langchain.schema.document

import me.shadaj.scalapy.py

@py.native
trait Document extends py.Object {
  def pageContent: String = as[py.Dynamic].page_content.as[String]

  def metadata: Map[String, String] = py.native

  def updateMetadata(key: String, newValue: String): Document = {
    val copy = py.module("copy").deepcopy(as[py.Dynamic])

    copy.metadata.bracketUpdate(key, newValue)

    copy.as[Document]
  }
}
