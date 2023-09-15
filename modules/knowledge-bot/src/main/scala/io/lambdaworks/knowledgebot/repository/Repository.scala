package io.lambdaworks.knowledgebot.repository

trait Repository[A] {
  def put(item: A): Unit
}
