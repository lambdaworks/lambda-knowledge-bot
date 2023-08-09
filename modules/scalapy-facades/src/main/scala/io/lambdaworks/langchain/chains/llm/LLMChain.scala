package io.lambdaworks.langchain.chains.llm

import io.lambdaworks.langchain.chains.base.Chain
import io.lambdaworks.langchain.schema.languagemodel.BaseLanguageModel
import io.lambdaworks.langchain.schema.outputparser.BaseLLMOutputParser
import io.lambdaworks.langchain.schema.prompttemplate.BasePromptTemplate
import me.shadaj.scalapy.py

@py.native
trait LLMChain extends Chain {
  def apply(llm: BaseLanguageModel, outputParser: BaseLLMOutputParser, prompt: BasePromptTemplate): LLMChain =
    as[py.Dynamic].applyNamed("llm" -> llm, "output_parser" -> outputParser, "prompt" -> prompt).as[LLMChain]
}
