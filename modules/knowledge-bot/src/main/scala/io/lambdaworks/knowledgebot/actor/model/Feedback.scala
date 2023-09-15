package io.lambdaworks.knowledgebot.actor.model

sealed trait Feedback

case object Positive extends Feedback
case object Negative extends Feedback
