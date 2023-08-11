package io.lambdaworks.langchain.llms.openai

import io.lambdaworks.langchain.schema.languagemodel.BaseLanguageModel
import me.shadaj.scalapy.py

@py.native
trait OpenAI extends BaseLanguageModel {
  def apply(modelName: String, temperature: Double): OpenAI =
    as[py.Dynamic].applyNamed("model_name" -> modelName, "temperature" -> temperature).as[OpenAI]
}
