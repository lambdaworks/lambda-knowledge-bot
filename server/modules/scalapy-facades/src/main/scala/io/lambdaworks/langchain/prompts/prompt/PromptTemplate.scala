package io.lambdaworks.langchain.prompts.prompt

import io.lambdaworks.langchain.schema.prompttemplate.BasePromptTemplate
import me.shadaj.scalapy.py

@py.native
trait PromptTemplate extends BasePromptTemplate {
  def fromTemplate(template: String): PromptTemplate =
    as[py.Dynamic].from_template(template).as[PromptTemplate]
}
