package io.lambdaworks.knowledgebot.vectordb.qdrant

import io.lambdaworks.knowledgebot.fetcher.Document
import io.lambdaworks.knowledgebot.vectordb.VectorDatabase
import io.lambdaworks.langchain.embeddings.EmbeddingsModule
import io.lambdaworks.langchain.schema.retriever.BaseRetriever
import io.lambdaworks.langchain.textsplitter.TextSplitterModule
import io.lambdaworks.langchain.vectorstores.VectorStoresModule
import io.lambdaworks.qdrantclient.qdrantclient.QdrantClientModule

class QdrantDatabase(openaiApiKey: String, clusterUrl: String, apiKey: String, collectionName: String)
    extends VectorDatabase {
  def asRetriever: BaseRetriever =
    VectorStoresModule
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

    VectorStoresModule.Qdrant.fromDocuments(
      splits,
      embeddings,
      url = clusterUrl,
      collectionName = collectionName,
      preferGRPC = true,
      apiKey = apiKey,
      forceRecreate = true
    )
  }

  private val client = QdrantClientModule.QdrantClient(url = clusterUrl, apiKey = apiKey)

  private val embeddings = EmbeddingsModule.openai.OpenAIEmbeddings(openaiApiKey = openaiApiKey)

  private val markdownSplitter = TextSplitterModule.MarkdownHeaderTextSplitter(
    headersToSplitOn = List(
      "#"     -> "topic",
      "##"    -> "subtopic",
      "###"   -> "subtopic",
      "####"  -> "subtopic",
      "#####" -> "subtopic"
    )
  )

  private val recursiveTextSplitter = TextSplitterModule.RecursiveCharacterTextSplitter(
    chunkSize = 250,
    chunkOverlap = 30,
    separators = List("\n\n", "\n*", "\n", " ", "")
  )
}
