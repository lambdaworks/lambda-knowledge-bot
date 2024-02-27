package io.lambdaworks.knowledgebot.actor.model.slack

final case class Interaction(id: SlackMessageId, input: String, response: String)
