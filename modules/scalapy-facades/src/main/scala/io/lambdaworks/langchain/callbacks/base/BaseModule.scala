package io.lambdaworks.langchain.callbacks.base

import me.shadaj.scalapy.py

@py.native
object BaseModule extends py.StaticModule("langchain.callbacks.base") {
  def BaseCallbackHandler: BaseCallbackHandler = py.native
}
