package io.lambdaworks.langchain.chatmodels

import io.lambdaworks.langchain.chatmodels.openai.ChatOpenAI
import me.shadaj.scalapy.py

@py.native
trait ChatModelsModule extends py.Object {
  def ChatOpenAI: ChatOpenAI = py.native
}
