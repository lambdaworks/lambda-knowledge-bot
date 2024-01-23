package io.lambdaworks.langchain.memory

import io.lambdaworks.langchain.memory.tokenbuffer.ConversationTokenBufferMemory
import me.shadaj.scalapy.py

@py.native
object MemoryModule extends py.StaticModule("langchain.memory") {
  def ConversationTokenBufferMemory: ConversationTokenBufferMemory = py.native
}
