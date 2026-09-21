environment = "staging"
aws_region  = "us-east-1"
vpc_cidr    = "10.1.0.0/16"
az_count    = 3

db_instance_class       = "db.r6g.large"
db_allocated_storage    = 200
db_engine_version       = "16.3"

redis_node_type         = "cache.r6g.large"
redis_engine_version    = "7.2"

eks_version             = "1.29"
eks_node_instance_types = ["m6i.large"]
eks_node_min_size       = 3
eks_node_max_size       = 10
eks_node_desired_size   = 4

s3_lifecycle_rules = [
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
    expiration = { days = 180 }
  }
]

s3_cors_rules = [
  {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["https://staging.sdc.example.com"]
    expose_headers  = ["ETag"]
    max_age         = 3600
  }
]