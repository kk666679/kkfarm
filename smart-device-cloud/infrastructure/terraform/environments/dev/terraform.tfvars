environment = "dev"
aws_region  = "us-east-1"
vpc_cidr    = "10.0.0.0/16"
az_count    = 2

db_instance_class       = "db.t3.medium"
db_allocated_storage    = 50
db_engine_version       = "16.3"

redis_node_type         = "cache.t3.micro"
redis_engine_version    = "7.2"

eks_version             = "1.29"
eks_node_instance_types = ["t3.medium"]
eks_node_min_size       = 2
eks_node_max_size       = 5
eks_node_desired_size   = 2

s3_lifecycle_rules = [
  {
    id      = "logs-expiration"
    status  = "Enabled"
    prefix  = "logs/"
    expiration = { days = 30 }
  }
]

s3_cors_rules = [
  {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["http://localhost:3000", "https://dev.sdc.example.com"]
    expose_headers  = ["ETag"]
    max_age         = 3600
  }
]