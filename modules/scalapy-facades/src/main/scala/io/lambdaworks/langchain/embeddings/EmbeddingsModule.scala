package io.lambdaworks.langchain.embeddings

import io.lambdaworks.langchain.embeddings.openai.OpenAIModule
import me.shadaj.scalapy.py

@py.native
object EmbeddingsModule extends py.StaticModule("langchain.embeddings") {
  def openai: OpenAIModule = py.native
}
