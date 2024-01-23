package io.lambdaworks.langchain.memory.tokenbuffer

import io.lambdaworks.langchain.schema.languagemodel.BaseLanguageModel
import io.lambdaworks.langchain.schema.memory.BaseMemory
import me.shadaj.scalapy.py

@py.native
trait ConversationTokenBufferMemory extends BaseMemory {
  def apply(
    llm: BaseLanguageModel,
    maxTokenLimit: Int,
    memoryKey: String,
    inputKey: String
  ): ConversationTokenBufferMemory =
    as[py.Dynamic]
      .applyNamed("llm" -> llm, "max_token_limit" -> maxTokenLimit, "memory_key" -> memoryKey, "input_key" -> inputKey)
      .as[ConversationTokenBufferMemory]
}
