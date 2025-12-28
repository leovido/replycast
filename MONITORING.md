# Monitoring Guide

## Overview

This project includes comprehensive monitoring using Prometheus and Grafana, providing real-time insights into your application's performance and health.

## Quick Start

```bash
# Production mode
docker-compose up -d

# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up
```

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Application | http://localhost:3000 | - |
| Grafana | http://localhost:3001 | admin / admin |
| Prometheus | http://localhost:9090 | - |
| Node Exporter | http://localhost:9100 | - |

## Grafana Dashboard

### Pre-configured Panels

1. **Request Rate**: Real-time HTTP request rates by method and route
2. **Response Time (p95)**: 95th percentile response time gauge
3. **CPU Usage**: System CPU utilization over time
4. **Memory Usage**: Memory consumption percentage

### Adding Custom Panels

1. Log into Grafana at http://localhost:3001
2. Navigate to Dashboards → Next.js Farcaster App Dashboard
3. Click "Add panel"
4. Use PromQL to query metrics from Prometheus

### Example PromQL Queries

```promql
# Request rate by status code
rate(http_requests_total[5m])

# Memory usage percentage
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# 99th percentile response time
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m])
```

## Prometheus Alerts

### Active Alerts

| Alert | Threshold | Duration | Severity |
|-------|-----------|----------|----------|
| HighErrorRate | >5% error rate | 5 minutes | Warning |
| ApplicationDown | Service unavailable | 1 minute | Critical |
| HighResponseTime | p95 > 1 second | 5 minutes | Warning |
| HighCpuUsage | >80% CPU | 5 minutes | Warning |
| HighMemoryUsage | >85% memory | 5 minutes | Warning |
| DiskSpaceLow | <15% available | 5 minutes | Warning |

### Viewing Alerts

Access Prometheus UI at http://localhost:9090/alerts to see:
- Active alerts
- Alert history
- Alert rules configuration

## Metrics Endpoints

### Application Metrics (`/api/metrics`)

```bash
curl http://localhost:3000/api/metrics
```

**Available Metrics:**
- `process_uptime_seconds`: Application uptime
- `http_requests_total`: Total HTTP requests
- `nodejs_memory_heap_used_bytes`: Node.js heap memory used
- `nodejs_memory_heap_total_bytes`: Total Node.js heap memory
- `nodejs_memory_external_bytes`: External memory usage

### Health Check (`/api/health`)

```bash
curl http://localhost:3000/api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "memory": {
    "rss": 123456789,
    "heapTotal": 123456789,
    "heapUsed": 123456789,
    "external": 123456789
  }
}
```

## Advanced Configuration

### Custom Alerts

Edit `monitoring/prometheus/alerts.yml`:

```yaml
groups:
  - name: custom_alerts
    rules:
      - alert: CustomAlert
        expr: your_metric > threshold
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Custom alert triggered"
          description: "Details about the alert"
```

Then reload Prometheus:
```bash
docker-compose restart prometheus
```

### Adding New Metrics

In your Next.js API routes:

```typescript
// pages/api/your-endpoint.ts
import { NextApiRequest, NextApiResponse } from 'next';

// Track custom metrics
let customMetric = 0;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  customMetric++;
  
  // Your logic here
  
  res.status(200).json({ success: true });
}

// Expose in /api/metrics endpoint
```

### Scrape Additional Services

Edit `monitoring/prometheus/prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'your-service'
    static_configs:
      - targets: ['your-service:port']
        labels:
          service: 'your-service'
```

## Troubleshooting

### Metrics Not Appearing

1. **Check Prometheus targets**:
   - Go to http://localhost:9090/targets
   - Ensure all targets show "UP"

2. **Test metrics endpoint**:
   ```bash
   curl http://localhost:3000/api/metrics
   ```

3. **Check Prometheus logs**:
   ```bash
   docker-compose logs prometheus
   ```

### Grafana Dashboard Empty

1. **Verify data source connection**:
   - Grafana → Configuration → Data Sources
   - Click "Test" on Prometheus datasource

2. **Check time range**:
   - Ensure dashboard time range includes data period

3. **Restart services**:
   ```bash
   docker-compose restart grafana prometheus
   ```

### High Memory Usage

1. **Adjust Prometheus retention**:
   ```yaml
   # docker-compose.yml
   command:
     - '--storage.tsdb.retention.time=7d'  # Reduce from 30d
   ```

2. **Limit scrape frequency**:
   ```yaml
   # prometheus.yml
   global:
     scrape_interval: 30s  # Increase from 15s
   ```

## Best Practices

### 1. Dashboard Organization

- Create separate dashboards for different concerns (app, infra, business)
- Use variables for dynamic filtering
- Include alert status panels

### 2. Metric Naming

Follow Prometheus conventions:
- Use snake_case: `http_requests_total`
- Include unit suffix: `_seconds`, `_bytes`, `_total`
- Be descriptive: `api_database_query_duration_seconds`

### 3. Alert Tuning

- Start with conservative thresholds
- Adjust based on baseline behavior
- Use appropriate duration before alerting
- Include meaningful annotations

### 4. Resource Management

```yaml
# docker-compose.yml
services:
  prometheus:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Production Deployment

### Security Checklist

- [ ] Change default Grafana admin password
- [ ] Enable HTTPS for all services
- [ ] Restrict network access to monitoring services
- [ ] Use secrets management for credentials
- [ ] Enable authentication for Prometheus
- [ ] Configure firewall rules

### Backup Strategy

```bash
# Backup Grafana dashboards
docker exec grafana grafana-cli admin export-dashboard > dashboard-backup.json

# Backup Prometheus data
docker run -v prometheus_data:/data -v $(pwd):/backup alpine tar czf /backup/prometheus-backup.tar.gz /data
```

### Performance Tuning

1. **Optimize scrape intervals** based on your needs
2. **Use recording rules** for expensive queries
3. **Enable compression** for remote storage
4. **Monitor monitoring stack** resource usage

## Additional Resources

- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Tutorial](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Next.js Performance Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance)
