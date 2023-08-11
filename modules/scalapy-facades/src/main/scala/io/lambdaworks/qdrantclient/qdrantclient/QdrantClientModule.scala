package io.lambdaworks.qdrantclient.qdrantclient

import me.shadaj.scalapy.py

@py.native
object QdrantClientModule extends py.StaticModule("qdrant_client") {
  def QdrantClient: QdrantClient = py.native
}
