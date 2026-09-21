variable "environment" {
  type        = string
  description = "Deployment environment (dev, staging, prod)"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "aws_region" {
  type        = string
  description = "AWS region for resources"
  default     = "us-east-1"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR block"
  default     = "10.0.0.0/16"
}

variable "az_count" {
  type        = number
  description = "Number of availability zones"
  default     = 3
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  type        = number
  description = "RDS allocated storage in GB"
  default     = 100
}

variable "db_engine_version" {
  type        = string
  description = "PostgreSQL engine version"
  default     = "16.3"
}

variable "redis_node_type" {
  type        = string
  description = "ElastiCache node type"
  default     = "cache.r6g.xlarge"
}

variable "redis_engine_version" {
  type        = string
  description = "Redis engine version"
  default     = "7.2"
}

variable "s3_lifecycle_rules" {
  type = list(object({
    id      = string
    status  = string
    prefix  = optional(string)
    tags    = optional(map(string))
    expiration = optional(object({
      days = number
    }))
    noncurrent_version_expiration = optional(object({
      noncurrent_days = number
    }))
  }))
  default = [
    {
      id      = "logs-expiration"
      status  = "Enabled"
      prefix  = "logs/"
      expiration = { days = 90 }
    },
    {
      id      = "backups-expiration"
      status  = "Enabled"
      prefix  = "backups/"
      expiration = { days = 365 }
    }
  ]
}

variable "s3_cors_rules" {
  type = list(object({
    allowed_headers = list(string)
    allowed_methods = list(string)
    allowed_origins = list(string)
    expose_headers  = list(string)
    max_age         = number
  }))
  default = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
      allowed_origins = ["https://*.sdc.example.com"]
      expose_headers  = ["ETag"]
      max_age         = 3600
    }
  ]
}

variable "eks_version" {
  type        = string
  description = "EKS Kubernetes version"
  default     = "1.29"
}

variable "eks_node_instance_types" {
  type        = list(string)
  description = "EKS node group instance types"
  default     = ["m6i.xlarge"]
}

variable "eks_node_min_size" {
  type        = number
  description = "EKS node group minimum size"
  default     = 3
}

variable "eks_node_max_size" {
  type        = number
  description = "EKS node group maximum size"
  default     = 20
}

variable "eks_node_desired_size" {
  type        = number
  description = "EKS node group desired size"
  default     = 3
}