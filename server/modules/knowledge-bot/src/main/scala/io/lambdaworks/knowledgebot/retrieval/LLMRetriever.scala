package io.lambdaworks.knowledgebot.retrieval

import me.shadaj.scalapy.py

trait LLMRetriever {
  def retrieve(prompt: String): Map[String, py.Any]
}
