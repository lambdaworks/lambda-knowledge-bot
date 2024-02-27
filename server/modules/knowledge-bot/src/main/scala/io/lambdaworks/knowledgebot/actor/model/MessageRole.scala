package io.lambdaworks.knowledgebot.actor.model

sealed trait MessageRole

case object User      extends MessageRole
case object Assistant extends MessageRole
