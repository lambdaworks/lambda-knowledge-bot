module "key_pair" {
  source  = "terraform-aws-modules/key-pair/aws"
  version = "2.0.2"

  key_name           = "lambda-knowledge-bot-key"
  create_private_key = true
}


resource "aws_instance" "ec2_instance" {
  ami                  = "ami-0f844a9675b22ea32"
  instance_type        = "t2.micro"
  subnet_id            = aws_subnet.public[0].id
  security_groups      = [aws_security_group.lambda-knowledge-bot.id]
  key_name             = module.key_pair.key_pair_name
  iam_instance_profile = aws_iam_instance_profile.ecs_agent.name
  user_data            = file("init.sh")
}