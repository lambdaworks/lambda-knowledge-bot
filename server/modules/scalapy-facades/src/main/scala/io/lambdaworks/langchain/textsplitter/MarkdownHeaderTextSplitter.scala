package io.lambdaworks.langchain.textsplitter

import io.lambdaworks.langchain.schema.document.Document
import me.shadaj.scalapy.py
import me.shadaj.scalapy.py.SeqConverters

@py.native
trait MarkdownHeaderTextSplitter extends py.Object {
  def apply(headersToSplitOn: List[(String, String)]): MarkdownHeaderTextSplitter =
    as[py.Dynamic].applyNamed("headers_to_split_on" -> headersToSplitOn.toPythonProxy).as[MarkdownHeaderTextSplitter]

  def splitText(text: String): List[Document] = as[py.Dynamic].split_text(text).as[List[Document]]
}
