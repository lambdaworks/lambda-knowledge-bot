resource "aws_lb" "alb" {
  name               = "ecs-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.public[0].id, aws_subnet.public[1].id]
  security_groups    = [aws_security_group.lambda-knowledge-bot.id]
}

resource "aws_lb_listener" "alb_listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "3000"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.target_group.arn
  }
}

resource "aws_alb_target_group" "target_group" {
  name        = "lambda-knowledge-bot-target-group"
  port        = "3000"
  protocol    = "HTTP"
  vpc_id      = aws_vpc.this.id
  target_type = "instance"

}

output "alb_dns_name" {
  value = aws_lb.alb.dns_name
}
