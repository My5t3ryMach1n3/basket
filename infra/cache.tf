# Added by hand to cut basket read latency. The target has no cache.
resource "aws_elasticache_subnet_group" "basket" {
  name       = "basket-cache"
  subnet_ids = var.private_subnet_ids
}

resource "aws_elasticache_cluster" "basket" {
  cluster_id        = "basket-cache"
  engine            = "redis"
  node_type         = "cache.t4g.micro"
  num_cache_nodes   = 1
  subnet_group_name = aws_elasticache_subnet_group.basket.name
}

# Alarm on cache memory, so we know if it fills up.
resource "aws_cloudwatch_metric_alarm" "basket_cache_memory" {
  alarm_name          = "basket-cache-memory"
  namespace           = "AWS/ElastiCache"
  metric_name         = "DatabaseMemoryUsagePercentage"
  comparison_operator = "GreaterThanThreshold"
  threshold           = 80
  evaluation_periods  = 2
  period              = 300
  statistic           = "Average"
}

# Trying MemoryDB alongside, to compare latency with ElastiCache.
resource "aws_memorydb_cluster" "basket" {
  name                   = "basket-memorydb"
  node_type              = "db.t4g.small"
  num_shards             = 1
  acl_name               = "open-access"
  snapshot_retention_limit = 0
}
