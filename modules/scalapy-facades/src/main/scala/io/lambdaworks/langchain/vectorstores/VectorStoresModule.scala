package io.lambdaworks.langchain.vectorstores

import me.shadaj.scalapy.py

@py.native
trait VectorStoresModule extends py.Object {
  def Qdrant: Qdrant = py.native
}
