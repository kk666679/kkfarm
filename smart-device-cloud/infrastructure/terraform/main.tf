terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }

  backend "s3" {
    bucket         = "sdc-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "smart-device-cloud"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

module "networking" {
  source      = "./modules/networking"
  environment = var.environment
  cidr_block  = var.vpc_cidr
  az_count    = var.az_count
}

module "database" {
  source           = "./modules/database"
  environment      = var.environment
  vpc_id           = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  instance_class   = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  engine_version   = var.db_engine_version
  multi_az         = var.environment == "prod"
  backup_retention = var.environment == "prod" ? 30 : 7
}

module "redis" {
  source               = "./modules/redis"
  environment          = var.environment
  vpc_id               = module.networking.vpc_id
  private_subnet_ids   = module.networking.private_subnet_ids
  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "prod" ? 2 : 1
  engine_version       = var.redis_engine_version
  at_rest_encryption   = true
  transit_encryption   = true
}

module "object-storage" {
  source           = "./modules/object-storage"
  environment      = var.environment
  bucket_name      = "sdc-${var.environment}-${random_id.bucket_suffix.hex}"
  versioning       = var.environment == "prod"
  lifecycle_rules  = var.s3_lifecycle_rules
  cors_rules       = var.s3_cors_rules
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

module "eks" {
  source                 = "./modules/eks"
  environment            = var.environment
  vpc_id                 = module.networking.vpc_id
  private_subnet_ids     = module.networking.private_subnet_ids
  public_subnet_ids      = module.networking.public_subnet_ids
  cluster_version        = var.eks_version
  node_group_instance_types = var.eks_node_instance_types
  node_group_min_size    = var.eks_node_min_size
  node_group_max_size    = var.eks_node_max_size
  node_group_desired_size = var.eks_node_desired_size
}

output "vpc_id" {
  value = module.networking.vpc_id
}

output "database_endpoint" {
  value     = module.database.endpoint
  sensitive = true
}

output "redis_endpoint" {
  value     = module.redis.primary_endpoint
  sensitive = true
}

output "object_storage_bucket" {
  value = module.object-storage.bucket_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "eks_cluster_arn" {
  value = module.eks.cluster_arn
}