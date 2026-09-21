environment = "prod"
aws_region  = "us-east-1"
vpc_cidr    = "10.2.0.0/16"
az_count    = 3

db_instance_class       = "db.r6g.xlarge"
db_allocated_storage    = 500
db_engine_version       = "16.3"

redis_node_type         = "cache.r6g.xlarge"
redis_engine_version    = "7.2"

eks_version             = "1.29"
eks_node_instance_types = ["m6i.xlarge", "m6i.2xlarge"]
eks_node_min_size       = 5
eks_node_max_size       = 30
eks_node_desired_size   = 8

s3_lifecycle_rules = [
  {
    id      = "logs-expiration"
    status  = "Enabled"
    prefix  = "logs/"
    expiration = { days = 365 }
  },
  {
    id      = "backups-expiration"
    status  = "Enabled"
    prefix  = "backups/"
    expiration = { days = 2555 }
  },
  {
    id      = "temp-expiration"
    status  = "Enabled"
    prefix  = "temp/"
    expiration = { days = 7 }
  }
]

s3_cors_rules = [
  {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["https://sdc.example.com", "https://app.sdc.example.com", "https://api.sdc.example.com"]
    expose_headers  = ["ETag"]
    max_age         = 3600
  }
]