package io.lambdaworks.langchain.embeddings

import io.lambdaworks.langchain.embeddings.openai.OpenAIModule
import me.shadaj.scalapy.py

@py.native
trait EmbeddingsModule extends py.Object {
  def openai: OpenAIModule = py.native
}
