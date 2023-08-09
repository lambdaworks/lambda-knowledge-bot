package io.lambdaworks.langchain.chatmodels.openai

import io.lambdaworks.langchain.llms.OpenAI
import io.lambdaworks.langchain.schema.languagemodel.BaseLanguageModel
import me.shadaj.scalapy.py

@py.native
trait ChatOpenAI extends BaseLanguageModel {
  def apply(modelName: String, temperature: Double): OpenAI =
    as[py.Dynamic].applyNamed("model_name" -> modelName, "temperature" -> temperature).as[OpenAI]
}
