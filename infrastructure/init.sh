#!/bin/bash
sudo yum update -y
sudo yum install -y ecs-init
sudo amazon-linux-extras install -y ecs


sudo systemctl enable --now --no-block ecs.service
sudo systemctl enable --now --no-block docker.service

sudo sh -c 'echo "ECS_CLUSTER=lambdaworks-cluster" >> /etc/ecs/ecs.config'

sudo service docker start
sleep 5
sudo start ecs
