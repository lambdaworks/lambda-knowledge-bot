package io.lambdaworks.langchain.textsplitter

import me.shadaj.scalapy.py

@py.native
object TextSplitterModule extends py.StaticModule("langchain.text_splitter") {
  def MarkdownHeaderTextSplitter: MarkdownHeaderTextSplitter = py.native

  def RecursiveCharacterTextSplitter: RecursiveCharacterTextSplitter = py.native
}
