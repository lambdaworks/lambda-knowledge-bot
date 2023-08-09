package io.lambdaworks.qdrantclient.qdrantclient

import me.shadaj.scalapy.py

@py.native
trait QdrantClientModule extends py.Object {
  def QdrantClient: QdrantClient = py.native
}
