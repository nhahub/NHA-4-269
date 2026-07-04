# image 
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

# defult VPC
data "aws_vpc" "defult" {
  default = true
}
# subnet
data "aws_subnets" "defult" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.defult.id]
  }
}

#upload local key to aws key pair
resource "aws_key_pair" "key" {
  key_name   = var.key_name
  public_key = file(pathexpand(var.public_key_path))
}


#sg for 3 k3s nodes 
resource "aws_security_group" "k3s_SG" {
  name        = "${var.project}-k3s-sg"
  description = "k3s cluster + UIs + SSH"
  vpc_id      = data.aws_vpc.defult.id

  # SSH
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_ingress_cidr]
  }
  # NodePort range
  ingress {
    description = "NodePort services"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # HTTP/HTTPS for Traefik ingress (nice URL, no NodePort)
  ingress {
    description = "HTTP ingress"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    description = "HTTPS ingress"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # node 2 node
  ingress {
    description = "intra-cluster"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
  }
  # Egress for image pull from DH and SMTP to gmail
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project}-k3s-sg"
    Project = var.project
  }
}

# EC2
locals {
  nodes = {
    server     = "control-plane"
    app        = "app"
    monitoring = "monitoring"
  }
}

resource "aws_instance" "k3s" {
  for_each = local.nodes

  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = aws_key_pair.key.key_name
  subnet_id              = data.aws_subnets.defult.ids[0]
  vpc_security_group_ids = [aws_security_group.k3s_SG.id]

  root_block_device {
    volume_size = 40
    volume_type = "gp3"
  }

  tags = {
    Name    = "${var.project}-${each.key}"
    Role    = each.value
    Project = var.project
  }

  # Canonical publishes new Ubuntu AMIs often; the "most recent" data source
  # would otherwise force-replace all 3 running nodes (new IPs, cluster wiped)
  # on every apply. Ignore AMI drift so existing boxes stay put.
  lifecycle {
    ignore_changes = [ami]
  }
}