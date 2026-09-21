variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID"
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnet IDs"
}

variable "node_type" {
  type        = string
  description = "ElastiCache node type"
  default     = "cache.r6g.xlarge"
}

variable "num_cache_clusters" {
  type        = number
  description = "Number of cache clusters"
  default     = 1
}

variable "engine_version" {
  type        = string
  description = "Redis engine version"
  default     = "7.2"
}

variable "at_rest_encryption" {
  type        = bool
  description = "Enable at-rest encryption"
  default     = true
}

variable "transit_encryption" {
  type        = bool
  description = "Enable in-transit encryption"
  default     = true
}

variable "auth_token" {
  type        = string
  description = "Redis auth token"
  sensitive   = true
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "sdc-${var.environment}"
  subnet_ids = var.private_subnet_ids
}

resource "aws_security_group" "redis" {
  name        = "sdc-${var.environment}-redis"
  description = "Security group for ElastiCache"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sdc-${var.environment}-redis-sg"
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id    = "sdc-${var.environment}"
  description             = "SDC Redis ${var.environment}"
  engine                  = "redis"
  engine_version          = var.engine_version
  node_type               = var.node_type
  num_cache_clusters      = var.num_cache_clusters
  subnet_group_name       = aws_elasticache_subnet_group.main.name
  security_group_ids      = [aws_security_group.redis.id]
  at_rest_encryption_enabled  = var.at_rest_encryption
  transit_encryption_enabled  = var.transit_encryption
  auth_token              = var.auth_token
  automatic_failover_enabled = var.num_cache_clusters > 1
  multi_az_enabled        = var.num_cache_clusters > 1
  snapshot_retention_limit = var.environment == "prod" ? 30 : 1
  snapshot_window         = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"
  log_delivery_configuration {
    destination_type = "cloudwatch-logs"
    log_type         = "slow-log"
    destination_details {
      cloudwatch_logs {
        log_group = "/aws/elasticache/sdc-${var.environment}"
      }
    }
  }
  log_delivery_configuration {
    destination_type = "cloudwatch-logs"
    log_type         = "engine-log"
    destination_details {
      cloudwatch_logs {
        log_group = "/aws/elasticache/sdc-${var.environment}"
      }
    }
  }

  tags = {
    Name = "sdc-${var.environment}-redis"
  }
}

output "primary_endpoint" {
  value = aws_elasticache_replication_group.main.primary_endpoint_address
}

output "primary_endpoint_port" {
  value = aws_elasticache_replication_group.main.primary_endpoint_port
}

output "reader_endpoint" {
  value = aws_elasticache_replication_group.main.reader_endpoint_address
}

output "arn" {
  value = aws_elasticache_replication_group.main.arn
}