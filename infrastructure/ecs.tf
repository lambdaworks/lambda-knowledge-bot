resource "aws_ecs_cluster" "lambda-knowledge-bot-cluster" {
  name = "lambdaworks-cluster"
}

resource "aws_iam_role" "ecs_task_execution_role1" {
  name = "ecsTaskExecutionRole1"

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

resource "aws_iam_role_policy_attachment" "ecs-task-execution-role-policy-attachment" {
  role       = aws_iam_role.ecs_task_execution_role1.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "lambda-knowledge-bot" {
  network_mode = "bridge"
  # execution_role_arn = aws_iam_role.ecs_task_execution_role1.arn
  requires_compatibilities = ["EC2"]
  cpu                      = "256"
  memory                   = "512"
  family                   = "lambda-knowledge-bot"
  container_definitions    = <<EOF
  [
    {
      "name": "lambda-knowledge-bot",
      "image": "",
      "essential": true,
      "portMappings": [{
        "containerPort": 3000,
        "hostPort": 3000,
        "protocol":"tcp"
      }]
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
    container_port   = "3000"
    target_group_arn = aws_alb_target_group.my_target_group.arn
  }
  depends_on = [aws_lb_listener.my_alb_listener]
}