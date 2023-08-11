package io.lambdaworks.qdrantclient.qdrantclient

import me.shadaj.scalapy.py

@py.native
trait QdrantClient extends py.Object {
  def apply(apiKey: String, url: String): QdrantClient =
    as[py.Dynamic].applyNamed("api_key" -> apiKey, "url" -> url).as[QdrantClient]
}
