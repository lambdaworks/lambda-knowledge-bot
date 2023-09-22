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
