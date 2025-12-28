# Docker Setup with Monitoring

This project includes a complete Docker setup with Prometheus and Grafana for monitoring.

## Architecture

- **Next.js App**: Runs on port 3000
- **Prometheus**: Metrics collection on port 9090
- **Grafana**: Visualization dashboard on port 3001
- **Node Exporter**: System metrics on port 9100

## Quick Start

### Production Build

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Development Mode

```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose -f docker-compose.dev.yml down
```

## Accessing Services

- **Application**: http://localhost:3000
- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin`
- **Prometheus**: http://localhost:9090
- **Node Exporter**: http://localhost:9100

## Endpoints

### Application Endpoints

- `/api/health` - Health check endpoint
- `/api/metrics` - Prometheus metrics

### Grafana

The Grafana dashboard is pre-configured with:
- Next.js application metrics
- System metrics (CPU, Memory, Disk)
- Request rates and response times
- Custom alerts

## Monitoring Setup

### Metrics Collected

1. **Application Metrics**
   - HTTP request rates
   - Response times (p95, p99)
   - Request counts by route and method
   - Error rates
   - Memory usage
   - Process uptime

2. **System Metrics**
   - CPU usage
   - Memory usage
   - Disk I/O
   - Network I/O
   - File system usage

### Alerts

Prometheus is configured with the following alerts:
- High error rate (>5% errors for 5 minutes)
- Application down
- High response time (p95 > 1s)
- High CPU usage (>80% for 5 minutes)
- High memory usage (>85% for 5 minutes)
- Low disk space (<15% available)

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NEYNAR_API_KEY=your_api_key
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### Prometheus Configuration

Edit `monitoring/prometheus/prometheus.yml` to:
- Adjust scrape intervals
- Add new targets
- Configure alerting

### Grafana Dashboards

Custom dashboards are located in `monitoring/grafana/dashboards/`.
To add a new dashboard:

1. Create a JSON file in the dashboards directory
2. Restart Grafana: `docker-compose restart grafana`

## Troubleshooting

### Application won't start

```bash
# Check logs
docker-compose logs app

# Rebuild
docker-compose up --build
```

### Metrics not appearing

```bash
# Check Prometheus targets
# Go to http://localhost:9090/targets

# Test metrics endpoint
curl http://localhost:3000/api/metrics
```

### Grafana can't connect to Prometheus

```bash
# Check network
docker-compose ps

# Restart Grafana
docker-compose restart grafana
```

## Production Considerations

1. **Change default passwords**: Update Grafana admin password in production
2. **Persistent storage**: Volumes are configured for data persistence
3. **Resource limits**: Add resource limits to services in docker-compose.yml
4. **Security**: Use secrets management for sensitive data
5. **SSL/TLS**: Configure reverse proxy (nginx/traefik) for HTTPS
6. **Backup**: Regular backups of Prometheus and Grafana data

## Advanced Usage

### Scaling

```bash
# Scale the application
docker-compose up -d --scale app=3
```

### Custom Metrics

Add custom metrics in your Next.js API routes:

```typescript
// Example: Track custom metric
import { NextApiRequest, NextApiResponse } from 'next';

let customCounter = 0;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  customCounter++;
  // Your logic here
  res.status(200).json({ counter: customCounter });
}
```

### Health Checks

The application includes a health check endpoint (`/api/health`) that Docker uses to monitor container health.

## Cleanup

```bash
# Stop and remove containers, networks
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
