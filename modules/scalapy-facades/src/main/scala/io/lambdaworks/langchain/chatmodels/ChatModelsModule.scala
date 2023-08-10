package io.lambdaworks.langchain.chatmodels

import io.lambdaworks.langchain.chatmodels.openai.ChatOpenAI
import me.shadaj.scalapy.py

@py.native
object ChatModelsModule extends py.StaticModule("langchain.chat_models") {
  def ChatOpenAI: ChatOpenAI = py.native
}
