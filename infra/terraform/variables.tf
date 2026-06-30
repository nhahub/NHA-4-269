variable "aws_region" {
  description = "aws region for all resources"
  type = string
  default = "us-east-1"
}


variable "project" {
  description = "Name prefix for tagging/naming"
  type = string
  default = "wijha"
}

variable "instance_type" {
  description = "ec2 size for k3s nodes"
  type = string
  default = "t3.small"
}

variable "key_name" {
    description = "ec2 key pair name for ssh"
    type = string
    default = "wijha-key"  
}

variable "public_key_path" {
    description = "local public key uploaded as key pair using 'ssh-keygen' "
    type = string
    default = "~/.ssh/id_ed25519.pub"
}

variable "ssh_ingress_cidr" {
    description = "CIDR allowed SSH"
    type = string
    default = "0.0.0.0/0"
}