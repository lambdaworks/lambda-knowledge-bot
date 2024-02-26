package io.lambdaworks.knowledgebot.actor.model.slack

import io.lambdaworks.knowledgebot.actor.model.Feedback

final case class InteractionFeedback(feedback: Feedback, interaction: Interaction)
