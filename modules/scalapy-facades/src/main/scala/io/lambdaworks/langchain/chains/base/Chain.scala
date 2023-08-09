package io.lambdaworks.langchain.chains.base

import me.shadaj.scalapy.py

trait Chain extends py.Object {
  def apply(input: String): Map[String, py.Any] = as[py.Dynamic].__call__(input).as[Map[String, py.Any]]
}
