package io.lambdaworks.langchain.textsplitter

import me.shadaj.scalapy.py

@py.native
trait TextSplitterModule extends py.Object {
  def MarkdownHeaderTextSplitter: MarkdownHeaderTextSplitter = py.native

  def RecursiveCharacterTextSplitter: RecursiveCharacterTextSplitter = py.native
}
