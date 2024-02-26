package io.lambdaworks.knowledgebot.actor.model

import org.joda.time.DateTime

final case class Chat(id: String, userId: String, title: String, createdAt: DateTime)
