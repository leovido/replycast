# Docker Quick Start Guide

## 🚀 Getting Started in 3 Steps

### 1. Prerequisites

- Docker Desktop installed and running
- Docker Compose v2.0+

### 2. Configure Environment

```bash
# Copy environment template (if needed)
cp env.example .env

# Edit .env with your API keys
nano .env
```

### 3. Start Services

```bash
# Production build (optimized)
docker-compose up -d

# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up
```

## 🎯 Access Your Services

Open these URLs in your browser:

- **🌐 Your App**: http://localhost:3000
- **📊 Grafana Dashboard**: http://localhost:3001 (admin/admin)
- **📈 Prometheus**: http://localhost:9090
- **🔍 System Metrics**: http://localhost:9100/metrics

## 📊 What's Included

### Services

```
┌─────────────────┐
│  Next.js App    │ ← Your application
│  Port: 3000     │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
┌────────▼────────┐  ┌──────▼──────┐
│   Prometheus    │  │   Grafana   │
│   Port: 9090    │  │  Port: 3001 │
└────────┬────────┘  └─────────────┘
         │
┌────────▼────────┐
│ Node Exporter   │
│   Port: 9100    │
└─────────────────┘
```

### Features

✅ **Production-ready Docker setup**
- Multi-stage build for optimal image size
- Health checks enabled
- Standalone output mode
- Automatic restarts

✅ **Comprehensive Monitoring**
- Real-time application metrics
- System resource monitoring (CPU, Memory, Disk)
- Pre-configured Grafana dashboards
- Alerting rules for critical issues

✅ **Development Experience**
- Hot reload in dev mode
- Volume mounts for live updates
- Separate dev/prod configurations

## 🛠️ Common Commands

```bash
# View logs
docker-compose logs -f app         # App logs only
docker-compose logs -f             # All services

# Stop services
docker-compose down                # Stop containers
docker-compose down -v             # Stop and remove volumes

# Rebuild
docker-compose up --build          # Rebuild and start

# Scale application
docker-compose up -d --scale app=3 # Run 3 instances

# Check health
docker-compose ps                  # Service status
curl http://localhost:3000/api/health  # App health
```

## 📈 Monitoring Quick Tour

### 1. View Metrics

```bash
# Raw Prometheus metrics
curl http://localhost:3000/api/metrics

# Pretty-printed health check
curl http://localhost:3000/api/health | jq
```

### 2. Explore Grafana Dashboard

1. Go to http://localhost:3001
2. Login with `admin` / `admin`
3. Navigate to "Dashboards" → "Next.js Farcaster App Dashboard"
4. See real-time metrics:
   - Request rates
   - Response times
   - CPU & Memory usage
   - Error rates

### 3. Query Prometheus

1. Go to http://localhost:9090
2. Try these queries:
   ```promql
   # Request rate
   rate(http_requests_total[5m])
   
   # Memory usage
   nodejs_memory_heap_used_bytes
   
   # CPU usage
   100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)
   ```

## 🚨 Troubleshooting

### Port Already in Use

```bash
# Find what's using the port
lsof -i :3000

# Use different ports
docker-compose -f docker-compose.yml \
  -e APP_PORT=3001 \
  up
```

### Build Fails

```bash
# Clean build
docker-compose down -v
docker system prune -a
docker-compose up --build
```

### No Metrics in Grafana

```bash
# Check Prometheus targets
open http://localhost:9090/targets

# Restart services
docker-compose restart prometheus grafana
```

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Inspect container
docker inspect farcaster-app

# Shell into container
docker exec -it farcaster-app sh
```

## 📚 Next Steps

- **Production Deployment**: See [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Advanced Monitoring**: See [MONITORING.md](MONITORING.md)
- **Custom Alerts**: Edit `monitoring/prometheus/alerts.yml`
- **Custom Dashboards**: Add JSON files to `monitoring/grafana/dashboards/`

## 🔐 Security Notes

Before deploying to production:

1. **Change default passwords**
   ```bash
   # In docker-compose.yml, update:
   GF_SECURITY_ADMIN_PASSWORD=your_secure_password
   ```

2. **Use secrets management**
   ```bash
   # Use Docker secrets or environment files
   docker-compose --env-file .env.production up
   ```

3. **Enable HTTPS**
   - Use a reverse proxy (nginx, traefik)
   - Get SSL certificates (Let's Encrypt)

4. **Restrict access**
   - Use firewall rules
   - Enable authentication on Prometheus
   - Use VPN for internal services

## 💡 Tips

- **Resource Limits**: Add to docker-compose.yml for production
- **Log Rotation**: Configure Docker logging driver
- **Backups**: Regularly backup prometheus_data and grafana_data volumes
- **Updates**: Keep base images updated with `docker-compose pull`

## 🆘 Need Help?

- Check [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed documentation
- Review logs with `docker-compose logs -f`
- Visit Prometheus alerts: http://localhost:9090/alerts
- Check GitHub issues for common problems
