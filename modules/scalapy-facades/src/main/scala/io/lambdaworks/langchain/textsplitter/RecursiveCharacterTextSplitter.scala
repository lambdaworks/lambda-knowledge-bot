package io.lambdaworks.langchain.textsplitter

import io.lambdaworks.langchain.schema.document.Document
import me.shadaj.scalapy.py
import me.shadaj.scalapy.py.SeqConverters

@py.native
trait RecursiveCharacterTextSplitter extends py.Object {
  def apply(chunkSize: Int, chunkOverlap: Int, separators: List[String]): RecursiveCharacterTextSplitter =
    as[py.Dynamic]
      .applyNamed("chunk_size" -> chunkSize, "chunk_overlap" -> chunkOverlap, "separators" -> separators.toPythonCopy)
      .as[RecursiveCharacterTextSplitter]

  def splitDocuments(documents: List[Document]): List[Document] =
    as[py.Dynamic].split_documents(documents = documents.toPythonProxy).as[List[Document]]
}
