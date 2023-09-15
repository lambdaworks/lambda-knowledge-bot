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

# output "key" {
#   value = nonsensitive(module.key_pair.private_key_pem)
# }