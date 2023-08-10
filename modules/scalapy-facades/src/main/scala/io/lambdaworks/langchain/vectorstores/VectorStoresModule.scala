package io.lambdaworks.langchain.vectorstores

import io.lambdaworks.langchain.vectorstores.qdrant.Qdrant
import me.shadaj.scalapy.py

@py.native
object VectorStoresModule extends py.StaticModule("langchain.vectorstores") {
  def Qdrant: Qdrant = py.native
}
