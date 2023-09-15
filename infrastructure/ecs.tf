variable "image_version" {
  type = string
  default = "latest"
}
data "aws_secretsmanager_secret_version" "env"{
  secret_id = "/lambda-knowledge-bot/env"
}
locals {
  env_vars = [
    for key, value in jsondecode(data.aws_secretsmanager_secret_version.env.secret_string) : {
      "name": key,
      "value": value
    }
  ]
}

resource "aws_ecs_cluster" "lambda-knowledge-bot-cluster" {
  name = "lambdaworks-cluster"
}

resource "aws_iam_role" "ecs_execution_role" {
  name = "ecs-execution-role"

  assume_role_policy = <<EOF
  {
  "Version": "2012-10-17",
  "Statement": [
    {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
}
resource "aws_iam_role" "ecs_task_role" {
  name = "ecs-task-role"

  assume_role_policy = <<EOF
  {
  "Version": "2012-10-17",
  "Statement": [
    {
        "Action": "sts:AssumeRole",
        "Principal": {
          "Service": "ecs-tasks.amazonaws.com"
        },
        "Effect": "Allow",
        "Sid": ""
      }
    ]
  }
  EOF
}
resource "aws_iam_policy" "dynamodb_policy" {
  name        = "dynamodb_policy"
  description = "Policy to access DynamoDB"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = [
        "dynamodb:Scan",
        "dynamodb:Query",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      Effect   = "Allow",
      Resource = "arn:aws:dynamodb:eu-north-1:195175520793:table/LambdaKnowledgeBotInteractionFeedbackTable"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs-task-execution-role-policy-attachment" {
  role       = aws_iam_role.ecs_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}
resource "aws_iam_role_policy_attachment" "dynamodb_policy_attachment" {
  policy_arn = aws_iam_policy.dynamodb_policy.arn
  role       = aws_iam_role.ecs_role.name
}

resource "aws_cloudwatch_log_group" "lambda-knowledge-bot" {
  name = "/ecs/lambda-knowledge-bot"
}
resource "aws_ecs_task_definition" "lambda-knowledge-bot" {
  network_mode = "bridge"
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"
  family                   = "lambda-knowledge-bot"
  task_role_arn = aws_iam_role.ecs_task_role.arn
  container_definitions    = <<EOF
  [
    {
      "name": "lambda-knowledge-bot",
      "image": "195175520793.dkr.ecr.us-east-1.amazonaws.com/lambda-knowledge-bot:local",
      "essential": true,
      "environment":${jsonencode(local.env_vars)},
      "portMappings": [{
        "containerPort": 8080,
        "hostPort": 8080,
        "protocol":"tcp"
      }],
      "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/lambda-knowledge-bot",
        "awslogs-region": "us-east-1", 
        "awslogs-stream-prefix": "lambda-knowledge-bot" 
      }
    }
    }
  ]
  EOF
  
}

resource "aws_ecs_service" "lambda-knowledge-bot" {
  name            = "lambda-knowledge-bot-service"
  cluster         = aws_ecs_cluster.lambda-knowledge-bot-cluster.id
  task_definition = aws_ecs_task_definition.lambda-knowledge-bot.arn
  desired_count   = 1
  launch_type     = "EC2"
  load_balancer {
    container_name   = "lambda-knowledge-bot"
    container_port   = "8080"
    target_group_arn = aws_alb_target_group.target_group.arn
  }
  depends_on = [aws_lb_listener.alb_listener]
}