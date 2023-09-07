package io.lambdaworks.knowledgebot.retrieval.openai

import io.lambdaworks.knowledgebot.retrieval.LLMRetriever
import io.lambdaworks.knowledgebot.retrieval.openai.GPTRetriever.{ClassificationPromptTemplate, PromptTemplate}
import io.lambdaworks.langchain.chains.ChainsModule
import io.lambdaworks.langchain.chatmodels.ChatModelsModule
import io.lambdaworks.langchain.outputparsers.OutputParsersModule
import io.lambdaworks.langchain.schema.retriever.BaseRetriever
import io.lambdaworks.langchain.{LangChainModule, callbacks}
import me.shadaj.scalapy.py
import me.shadaj.scalapy.py.{PyQuote, SeqConverters}

import scala.concurrent.ExecutionContext

class GPTRetriever(retriever: BaseRetriever, onNewToken: String => Unit)(implicit ec: ExecutionContext)
    extends LLMRetriever {
  def retrieve(query: String): Map[String, py.Any] = {
    val output = qaChain(query)

    if (!llmChain(output("result").as[String])("text").as[Boolean]) {
      output.updated("source_documents", List[py.Dynamic]().toPythonProxy)
    } else {
      output
    }
  }

  private val onLLMNewToken: (py.Dynamic, String) => Unit = (self, token) => {
    self.token_queue.put(token)
    if (self.token_queue.full().as[Boolean]) {
      self.consumeQueue(self)
    }
  }

  private val consumeQueue: py.Dynamic => Unit = self => {
    var string = ""
    while (!self.token_queue.empty().as[Boolean]) {
      string += self.token_queue.get().as[String]
    }
    onNewToken(string)
  }

  private val CallbackHandler =
    py.Dynamic.global.`type`(
      "CallbackHandler",
      py"(${callbacks.base.BaseModule.BaseCallbackHandler}, )",
      Map(
        "token_queue"      -> py.module("queue").Queue(maxsize = 3),
        "on_llm_new_token" -> py"lambda self, token, **kwargs: self.onLLMNewToken(self, token)",
        "on_llm_end"       -> py"lambda self, response, **kwargs: self.consumeQueue(self)",
        "onLLMNewToken"    -> py.Any.from(onLLMNewToken),
        "consumeQueue"     -> py.Any.from(consumeQueue)
      )
    )

  private val llm = ChatModelsModule.ChatOpenAI(modelName = "gpt-3.5-turbo", temperature = 0)

  private val llmChain = LangChainModule.LLMChain(
    llm = llm,
    prompt = LangChainModule.PromptTemplate.fromTemplate(ClassificationPromptTemplate),
    outputParser = OutputParsersModule.BooleanOutputParser()
  )

  private val streamingLlm = ChatModelsModule.ChatOpenAI(
    modelName = "gpt-3.5-turbo",
    temperature = 0,
    streaming = true,
    callbacks = List(CallbackHandler())
  )

  private val qaChain = ChainsModule.RetrievalQA.fromChainType(
    llm = streamingLlm,
    retriever = retriever,
    returnSourceDocuments = true,
    prompt = LangChainModule.PromptTemplate.fromTemplate(PromptTemplate)
  )
}

object GPTRetriever {
  final val ClassificationPromptTemplate: String =
    """If the whole text is asking for more context or it is a negative sentence, return a single NO. Otherwise return a single YES.
      |
      |Input: {text}
      |
      |Classification:""".stripMargin

  final val PromptTemplate: String =
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
}
