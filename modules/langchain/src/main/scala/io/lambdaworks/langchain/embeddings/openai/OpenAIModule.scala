package io.lambdaworks.langchain.embeddings.openai

import me.shadaj.scalapy.py

@py.native
trait OpenAIModule extends py.Object {
  def OpenAIEmbeddings: OpenAIEmbeddings = py.native
}
