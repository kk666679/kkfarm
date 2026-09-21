variable "environment" {
  type        = string
  description = "Deployment environment"
}

variable "cidr_block" {
  type        = string
  description = "VPC CIDR block"
  default     = "10.0.0.0/16"
}

variable "az_count" {
  type        = number
  description = "Number of availability zones"
  default     = 3
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "main" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  instance_tenancy     = "default"

  tags = {
    Name = "sdc-${var.environment}"
  }
}

resource "aws_subnet" "private" {
  count                   = var.az_count
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.cidr_block, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "sdc-${var.environment}-private-${count.index}"
    Type = "private"
  }
}

resource "aws_subnet" "public" {
  count                   = var.az_count
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.cidr_block, 16, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "sdc-${var.environment}-public-${count.index}"
    Type = "public"
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "sdc-${var.environment}-igw"
  }
}

resource "aws_nat_gateway" "main" {
  count         = var.az_count
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id
  tags = {
    Name = "sdc-${var.environment}-nat-${count.index}"
  }
  depends_on = [aws_internet_gateway.main]
}

resource "aws_eip" "nat" {
  count  = var.az_count
  domain = "vpc"
  tags = {
    Name = "sdc-${var.environment}-nat-eip-${count.index}"
  }
}

resource "aws_route_table" "private" {
  count  = var.az_count
  vpc_id = aws_vpc.main.id
  route {
    nat_gateway_id = aws_nat_gateway.main[count.index].id
    destination_cidr_block = "0.0.0.0/0"
  }
  tags = {
    Name = "sdc-${var.environment}-private-rt-${count.index}"
  }
}

resource "aws_route_table_association" "private" {
  count          = var.az_count
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    gateway_id         = aws_internet_gateway.main.id
    destination_cidr_block = "0.0.0.0/0"
  }
  tags = {
    Name = "sdc-${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = var.az_count
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "eks_nodes" {
  name        = "sdc-${var.environment}-eks-nodes"
  description = "Security group for EKS nodes"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }

  ingress {
    from_port   = 0
    to_port     = 65535
    protocol    = "udp"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sdc-${var.environment}-eks-nodes-sg"
  }
}

resource "aws_security_group" "eks_control_plane" {
  name        = "sdc-${var.environment}-eks-control-plane"
  description = "Security group for EKS control plane"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    security_groups = [aws_security_group.eks_nodes.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "sdc-${var.environment}-eks-cp-sg"
  }
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "eks_nodes_sg_id" {
  value = aws_security_group.eks_nodes.id
}

output "eks_control_plane_sg_id" {
  value = aws_security_group.eks_control_plane.id
}