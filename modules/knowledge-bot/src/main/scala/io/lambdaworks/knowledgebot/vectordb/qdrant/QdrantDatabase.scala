package io.lambdaworks.knowledgebot.vectordb.qdrant

import io.lambdaworks.knowledgebot.fetcher.Document
import io.lambdaworks.knowledgebot.vectordb.VectorDatabase
import me.shadaj.scalapy.py
import me.shadaj.scalapy.py.SeqConverters

class QdrantDatabase(openaiApiKey: String, clusterUrl: String, apiKey: String, collectionName: String)
    extends VectorDatabase {
  def asRetriever: py.Dynamic =
    vectorstores
      .Qdrant(
        embeddings = embeddings,
        client = client,
        collection_name = collectionName
      )
      .as_retriever(search_kwargs = Map("score_threshold" -> 0.8))

  def upsert(documents: List[Document]): Unit = {
    val mdHeaderSplits =
      documents.flatMap { doc =>
        markdownSplitter
          .split_text(doc.content)
          .as[List[py.Dynamic]]
          .tapEach(_.metadata.bracketUpdate("source", doc.source))
      }

    val splits = recursiveTextSplitter.split_documents(mdHeaderSplits.toPythonProxy)

    vectorstores.Qdrant.from_documents(
      splits,
      embeddings,
      url = clusterUrl,
      collection_name = collectionName,
      prefer_grpc = true,
      api_key = apiKey,
      force_recreate = true
    )
  }

  private val openAIEmbeddings = py.module("langchain.embeddings.openai")
  private val textSplitter     = py.module("langchain.text_splitter")
  private val qdrantClient     = py.module("qdrant_client")
  private val vectorstores     = py.module("langchain.vectorstores")

  private val client = qdrantClient.QdrantClient(url = clusterUrl, api_key = apiKey)

  private val embeddings = openAIEmbeddings.OpenAIEmbeddings(openai_api_key = openaiApiKey)

  private val markdownSplitter = textSplitter.MarkdownHeaderTextSplitter(
    headers_to_split_on = List(
      "#"     -> "topic",
      "##"    -> "subtopic",
      "###"   -> "subtopic",
      "####"  -> "subtopic",
      "#####" -> "subtopic"
    ).toPythonProxy
  )

  private val recursiveTextSplitter = textSplitter.RecursiveCharacterTextSplitter(
    chunk_size = 250,
    chunk_overlap = 30,
    separators = List("\n\n", "\n*", "\n", " ", "").toPythonCopy
  )
}
