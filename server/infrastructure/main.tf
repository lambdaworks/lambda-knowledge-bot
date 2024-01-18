terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  cloud {
    organization = "lambdaworks"

    workspaces {
      name = "lambda-knowledge-bot"
    }
  }

}

provider "aws" {
  region = "us-east-1"
}

output "task_revision" {
  value = "${aws_ecs_task_definition.lambda-knowledge-bot.family}:${aws_ecs_task_definition.lambda-knowledge-bot.revision}"
}