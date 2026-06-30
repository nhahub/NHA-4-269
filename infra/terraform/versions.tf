terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "wijha-tfstate-amir01"
    key            = "infra/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "wijha-tf-lock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}