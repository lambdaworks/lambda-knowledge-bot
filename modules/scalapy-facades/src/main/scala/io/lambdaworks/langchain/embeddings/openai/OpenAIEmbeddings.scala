package io.lambdaworks.langchain.embeddings.openai

import io.lambdaworks.langchain.embeddings.base.Embeddings
import me.shadaj.scalapy.py

@py.native
trait OpenAIEmbeddings extends Embeddings {
  def apply(openaiApiKey: String): OpenAIEmbeddings =
    as[py.Dynamic].applyNamed("openai_api_key" -> openaiApiKey).as[OpenAIEmbeddings]
}
