package io.lambdaworks.knowledgebot.actor.model

final case class Interaction(id: SlackMessageId, input: String, response: String)
