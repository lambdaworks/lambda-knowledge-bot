variable "cidr_block" {
  default = "172.31.0.0/16"
}
variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b"]
}

resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "myVPC"
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.this.id
  cidr_block              = element(["172.31.0.0/20", "172.31.16.0/20"], count.index)
  availability_zone       = element(var.availability_zones, count.index)
  map_public_ip_on_launch = true
}


resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id
}

resource "aws_route_table" "public_subnets" {
  vpc_id = aws_vpc.this.id
}

resource "aws_route" "default_via_internet_gateway" {
  route_table_id         = aws_route_table.public_subnets.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this.id
}

resource "aws_route_table_association" "public_via_internet_gateway" {
  subnet_id      = aws_subnet.public[0].id
  route_table_id = aws_route_table.public_subnets.id
}

resource "aws_main_route_table_association" "this" {
  vpc_id         = aws_vpc.this.id
  route_table_id = aws_route_table.public_subnets.id
}


resource "aws_security_group" "lambda-knowledge-bot" {
  name   = "lambda-knowledge-bot-sg"
  vpc_id = aws_vpc.this.id

  ingress {
    description = "allow all inbound rules"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    description = "allow all outbound rules"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

}

output "subnet_id" {
  value = [for subnet in aws_subnet.public : subnet.id]
}