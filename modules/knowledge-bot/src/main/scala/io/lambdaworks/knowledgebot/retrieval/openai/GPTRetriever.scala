package io.lambdaworks.knowledgebot.retrieval.openai

import io.lambdaworks.knowledgebot.retrieval.LLMRetriever
import io.lambdaworks.langchain.LangChainModule
import io.lambdaworks.langchain.chains.ChainsModule
import io.lambdaworks.langchain.chatmodels.ChatModelsModule
import io.lambdaworks.langchain.outputparsers.OutputParsersModule
import io.lambdaworks.langchain.schema.retriever.BaseRetriever
import me.shadaj.scalapy.py
import me.shadaj.scalapy.py.SeqConverters

class GPTRetriever(retriever: BaseRetriever) extends LLMRetriever {
  def retrieve(query: String): Map[String, py.Any] = {
    val output = qaChain(query)

    if (!llmChain(output("result").as[String])("text").as[Boolean]) {
      output.updated("source_documents", List[py.Dynamic]().toPythonProxy)
    } else {
      output
    }
  }

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

  private val llm = ChatModelsModule.ChatOpenAI(modelName = "gpt-3.5-turbo", temperature = 0)

  private val llmChain = LangChainModule.LLMChain(
    llm = llm,
    prompt = LangChainModule.PromptTemplate.fromTemplate(classificationPromptTemplate),
    outputParser = OutputParsersModule.BooleanOutputParser()
  )

  private val qaChain = ChainsModule.RetrievalQA.fromChainType(
    llm = llm,
    retriever = retriever,
    returnSourceDocuments = true,
    prompt = LangChainModule.PromptTemplate.fromTemplate(promptTemplate)
  )
}
