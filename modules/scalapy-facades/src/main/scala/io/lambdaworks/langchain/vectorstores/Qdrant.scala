package io.lambdaworks.langchain.vectorstores

import io.lambdaworks.langchain.embeddings.base.Embeddings
import io.lambdaworks.langchain.schema.document.Document
import io.lambdaworks.langchain.schema.retriever.BaseRetriever
import io.lambdaworks.qdrantclient.qdrantclient.QdrantClient
import me.shadaj.scalapy.py

@py.native
trait Qdrant extends py.Object with VectorStore {
  def apply(client: QdrantClient, collectionName: String, embeddings: Embeddings): Qdrant =
    as[py.Dynamic]
      .applyNamed("client" -> client, "collection_name" -> collectionName, "embeddings" -> embeddings)
      .as[Qdrant]

  def asRetriever(scoreThreshold: Double): BaseRetriever =
    as[py.Dynamic].as_retriever(search_kwargs = Map("score_threshold" -> scoreThreshold)).as[BaseRetriever]

  def fromDocuments(
    documents: List[Document],
    embedding: Embeddings,
    url: String,
    collectionName: String,
    preferGRPC: Boolean,
    apiKey: String,
    forceRecreate: Boolean
  ): Qdrant = as[py.Dynamic]
    .from_documents(
      documents.toPythonProxy,
      embedding,
      url = url,
      collection_name = collectionName,
      prefer_grpc = preferGRPC,
      api_key = apiKey,
      force_recreate = forceRecreate
    )
    .as[Qdrant]
}
