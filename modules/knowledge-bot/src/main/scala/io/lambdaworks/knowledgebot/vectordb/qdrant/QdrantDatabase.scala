package io.lambdaworks.knowledgebot.vectordb.qdrant

import io.lambdaworks.knowledgebot.fetcher.Document
import io.lambdaworks.knowledgebot.vectordb.VectorDatabase
import io.lambdaworks.langchain.LangChainModule
import io.lambdaworks.langchain.schema.retriever.BaseRetriever
import io.lambdaworks.qdrantclient.qdrantclient.QdrantClientModule
import me.shadaj.scalapy.py

class QdrantDatabase(openaiApiKey: String, clusterUrl: String, apiKey: String, collectionName: String)
    extends VectorDatabase {
  def asRetriever: BaseRetriever =
    langchain.vectorstores
      .Qdrant(
        embeddings = embeddings,
        client = client,
        collectionName = collectionName
      )
      .asRetriever(scoreThreshold = 0.8)

  def upsert(documents: List[Document]): Unit = {
    val mdHeaderSplits =
      documents.flatMap { doc =>
        markdownSplitter
          .splitText(doc.content)
          .map(_.updateMetadata("source", doc.source))
      }

    val splits = recursiveTextSplitter.splitDocuments(mdHeaderSplits)

    langchain.vectorstores.Qdrant.fromDocuments(
      splits,
      embeddings,
      url = clusterUrl,
      collectionName = collectionName,
      preferGRPC = true,
      apiKey = apiKey,
      forceRecreate = true
    )
  }

  private val langchain    = py.module("langchain").as[LangChainModule]
  private val qdrantClient = py.module("qdrant_client").as[QdrantClientModule]

  private val client = qdrantClient.QdrantClient(url = clusterUrl, apiKey = apiKey)

  private val embeddings = langchain.embeddings.openai.OpenAIEmbeddings(openaiApiKey = openaiApiKey)

  private val markdownSplitter = langchain.textSplitter.MarkdownHeaderTextSplitter(
    headersToSplitOn = List(
      "#"     -> "topic",
      "##"    -> "subtopic",
      "###"   -> "subtopic",
      "####"  -> "subtopic",
      "#####" -> "subtopic"
    )
  )

  private val recursiveTextSplitter = langchain.textSplitter.RecursiveCharacterTextSplitter(
    chunkSize = 250,
    chunkOverlap = 30,
    separators = List("\n\n", "\n*", "\n", " ", "")
  )
}
