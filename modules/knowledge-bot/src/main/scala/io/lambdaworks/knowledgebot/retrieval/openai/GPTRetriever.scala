package io.lambdaworks.knowledgebot.retrieval.openai

import io.lambdaworks.knowledgebot.retrieval.LLMRetriever
import me.shadaj.scalapy.py
import me.shadaj.scalapy.py.SeqConverters

class GPTRetriever(retriever: py.Any) extends LLMRetriever {
  def retrieve(query: String): py.Dynamic = {
    val output = qaChain(query)

    if (!llmChain(output.bracketAccess("result").as[String]).bracketAccess("text").as[Boolean]) {
      output.bracketUpdate("source_documents", List[py.Dynamic]().toPythonProxy)
    }

    output
  }

  private val chains        = py.module("langchain.chains")
  private val chatModels    = py.module("langchain.chat_models")
  private val langchain     = py.module("langchain")
  private val outputParsers = py.module("langchain.output_parsers")

  private val llm = chatModels.ChatOpenAI(model_name = "gpt-3.5-turbo", temperature = 0)

  private val classificationPromptTemplate =
    """If the input is asking for more context or it is a negative sentence, return NO. Otherwise return YES.
      |
      |Input: {input}
      |
      |Classification:""".stripMargin

  private val promptTemplate =
    "Use the following pieces of context about the company to answer the question at the end." +
      "Every answer to a question you give should be in the language it was asked in, same if you don't know the answer." +
      "If the context doesn't contain the answer, just say that you don't know, don't try to make up an answer." +
      "Don't give opinionated answers." +
      """
        |
        |{context}
        |
        |Question: {question}
        |Helpful Answer:""".stripMargin

  private val llmChain = chains.LLMChain(
    llm = llm,
    prompt = langchain.PromptTemplate.from_template(classificationPromptTemplate),
    output_parser = outputParsers.BooleanOutputParser()
  )

  private val qaChain = chains.RetrievalQA.from_chain_type(
    llm,
    retriever = retriever,
    return_source_documents = true,
    chain_type_kwargs = Map("prompt" -> langchain.PromptTemplate.from_template(promptTemplate))
  )
}
