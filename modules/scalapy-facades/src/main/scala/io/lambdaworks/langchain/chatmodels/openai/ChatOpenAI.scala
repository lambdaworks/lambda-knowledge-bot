package io.lambdaworks.langchain.chatmodels.openai

import io.lambdaworks.langchain.llms.openai.OpenAI
import io.lambdaworks.langchain.schema.languagemodel.BaseLanguageModel
import me.shadaj.scalapy.py

@py.native
trait ChatOpenAI extends BaseLanguageModel {
  def apply(
    modelName: String,
    temperature: Double,
    streaming: Boolean = false,
    callbacks: py.NoneOr[List[py.Dynamic]] = py.None
  ): OpenAI =
    as[py.Dynamic]
      .applyNamed(
        "model_name"  -> modelName,
        "temperature" -> temperature,
        "streaming"   -> streaming,
        "callbacks"   -> callbacks.map(identity, _.toPythonCopy)
      )
      .as[OpenAI]
}
