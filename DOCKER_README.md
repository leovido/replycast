# 🐳 Docker + Monitoring Setup

## Overview

Your Farcaster Next.js application is now fully containerized with production-grade monitoring using Prometheus and Grafana.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Docker Network                       │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                  │
│  │  Next.js App │◄───┤  Prometheus  │                  │
│  │  Port: 3000  │    │  Port: 9090  │                  │
│  │              │    │              │                  │
│  │ /api/health  │    │  - Scrapes   │                  │
│  │ /api/metrics │    │  - Stores    │                  │
│  └──────────────┘    │  - Alerts    │                  │
│                      └───────┬──────┘                  │
│                              │                          │
│                      ┌───────▼──────┐                  │
│                      │   Grafana    │                  │
│                      │  Port: 3001  │                  │
│  ┌──────────────┐    │              │                  │
│  │    Node      │◄───┤  - Dashboards│                  │
│  │  Exporter    │    │  - Queries   │                  │
│  │  Port: 9100  │    │  - Alerts    │                  │
│  └──────────────┘    └──────────────┘                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Fastest Way (Using Make)

```bash
# Show all available commands
make help

# Start everything in production mode
make prod

# Or start in development mode with hot reload
make dev

# Check status
make status
```

### Traditional Way (Using Docker Compose)

```bash
# Production
docker-compose up -d

# Development (with hot reload)
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose down
```

## 📊 Access Points

| Service | URL | Login | Description |
|---------|-----|-------|-------------|
| 🌐 **Application** | http://localhost:3000 | - | Your Next.js app |
| 📊 **Grafana** | http://localhost:3001 | admin/admin | Visualization & dashboards |
| 📈 **Prometheus** | http://localhost:9090 | - | Metrics & alerting |
| 🔍 **Node Exporter** | http://localhost:9100 | - | System metrics |
| ❤️ **Health Check** | http://localhost:3000/api/health | - | App health status |
| 📉 **Metrics** | http://localhost:3000/api/metrics | - | Prometheus format metrics |

## 📁 Project Structure

```
.
├── Dockerfile                    # Production image
├── Dockerfile.dev                # Dev image with hot reload
├── docker-compose.yml            # Production orchestration
├── docker-compose.dev.yml        # Development orchestration
├── .dockerignore                 # Build exclusions
├── Makefile                      # Convenience commands
│
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml       # Scrape config
│   │   └── alerts.yml           # Alert rules
│   └── grafana/
│       ├── provisioning/
│       │   ├── datasources/     # Prometheus connection
│       │   └── dashboards/      # Auto-load dashboards
│       └── dashboards/
│           └── nextjs-dashboard.json  # Pre-built dashboard
│
├── pages/api/
│   ├── health.ts                # Health endpoint
│   └── metrics.ts               # Metrics endpoint
│
└── docs/
    ├── DOCKER_QUICK_START.md    # Get started in 3 steps
    ├── DOCKER_SETUP.md          # Detailed guide
    ├── MONITORING.md            # Monitoring guide
    └── DEPLOYMENT_SUMMARY.md    # What was added
```

## 🎯 Key Features

### ✅ Production Ready
- Multi-stage Docker build (optimized size)
- Health checks built-in
- Automatic container restart
- Volume persistence for data
- Security best practices

### ✅ Development Friendly
- Hot reload support
- Live log streaming
- Separate dev/prod configs
- Quick iteration cycle

### ✅ Comprehensive Monitoring
- Application performance metrics
- System resource monitoring
- Custom metrics support
- Pre-configured dashboards
- Automatic alerting

### ✅ Easy to Use
- Simple Make commands
- One-command deployment
- Automatic service discovery
- Pre-configured everything

## 🛠️ Common Tasks

### Starting Services

```bash
# Production (optimized build)
make prod

# Development (hot reload)
make dev

# Check what's running
make status
```

### Viewing Logs

```bash
# All services
make logs

# Just the app
make logs-app

# Just Prometheus
make logs-prometheus

# Just Grafana
make logs-grafana
```

### Monitoring

```bash
# Check app health
make health

# View metrics
make metrics

# Open Grafana dashboard
make open-grafana

# Open Prometheus UI
make open-prometheus
```

### Maintenance

```bash
# Restart everything
make restart

# Restart just the app
make restart-app

# Stop everything
make down

# Clean everything (including volumes)
make clean

# Backup Prometheus data
make backup-prometheus

# Backup Grafana dashboards
make backup-grafana
```

### Scaling

```bash
# Run 3 instances of the app
make scale n=3

# Or with docker-compose
docker-compose up -d --scale app=3
```

## 📈 What You Get Out of the Box

### Grafana Dashboard

Pre-configured panels for:
- 📊 Request Rate (by method and route)
- ⏱️ Response Time (p95 percentile)
- 💻 CPU Usage (system-wide)
- 💾 Memory Usage (percentage)

### Prometheus Alerts

Automatically alerts on:
- 🚨 **HighErrorRate**: >5% error rate for 5 minutes
- 🚨 **ApplicationDown**: Service unavailable for 1 minute
- 🚨 **HighResponseTime**: p95 > 1 second for 5 minutes
- 🚨 **HighCpuUsage**: >80% CPU for 5 minutes
- 🚨 **HighMemoryUsage**: >85% memory usage
- 🚨 **DiskSpaceLow**: <15% disk space available

### API Endpoints

- **`/api/health`**: JSON health status with uptime and memory
- **`/api/metrics`**: Prometheus-format metrics for scraping

## 🔧 Configuration

### Environment Variables

Copy `.env.docker` to `.env` and customize:

```env
NEYNAR_API_KEY=your_key_here
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_id_here
NODE_ENV=production
```

### Customize Monitoring

**Add custom metrics** in `pages/api/metrics.ts`:
```typescript
output.push('# HELP my_custom_metric My custom metric');
output.push('# TYPE my_custom_metric gauge');
output.push(`my_custom_metric ${myValue}`);
```

**Adjust alert thresholds** in `monitoring/prometheus/alerts.yml`:
```yaml
- alert: CustomAlert
  expr: my_metric > 100
  for: 5m
```

**Create custom dashboards** in Grafana:
1. Design in UI
2. Export as JSON
3. Save to `monitoring/grafana/dashboards/`

## 🚨 Troubleshooting

### Service won't start

```bash
# Check logs
make logs-app

# Rebuild from scratch
make clean
make build
make up
```

### No metrics in Grafana

```bash
# Verify Prometheus targets
make open-prometheus
# Navigate to Status → Targets
# All should show "UP"

# Restart services
make restart
```

### Port conflicts

```bash
# Check what's using ports
lsof -i :3000
lsof -i :3001
lsof -i :9090

# Edit ports in docker-compose.yml if needed
```

### Memory issues

```bash
# Check Docker resources
docker stats

# Add limits in docker-compose.yml:
# services:
#   app:
#     deploy:
#       resources:
#         limits:
#           memory: 512M
```

## 📚 Documentation

- **[DOCKER_QUICK_START.md](DOCKER_QUICK_START.md)** - Start here! 3-step guide
- **[DOCKER_SETUP.md](DOCKER_SETUP.md)** - Comprehensive Docker documentation
- **[MONITORING.md](MONITORING.md)** - Monitoring deep dive
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - What was added

## 🎓 Next Steps

### Immediate
1. ✅ Run `make prod` or `make dev`
2. ✅ Open http://localhost:3001 (Grafana)
3. ✅ View the pre-configured dashboard
4. ✅ Check http://localhost:3000/api/metrics

### Short Term
- [ ] Customize Grafana dashboard
- [ ] Add application-specific metrics
- [ ] Adjust alert thresholds
- [ ] Configure alert notifications

### Production
- [ ] Change default passwords
- [ ] Set up SSL/TLS
- [ ] Configure backup strategy
- [ ] Add resource limits
- [ ] Set up log aggregation
- [ ] Configure secrets management

## 💡 Pro Tips

1. **Use Make**: It's easier than remembering Docker Compose commands
   ```bash
   make help  # See all available commands
   ```

2. **Monitor from day one**: Grafana is already set up
   ```bash
   make open-grafana
   ```

3. **Check health regularly**: Built-in endpoint
   ```bash
   make health
   ```

4. **Keep it updated**: Pull latest images
   ```bash
   make pull
   make update
   ```

5. **Backup your data**: Automated backup commands
   ```bash
   make backup-prometheus
   make backup-grafana
   ```

## 🤝 Getting Help

1. Run `make help` to see all commands
2. Check logs with `make logs`
3. Review documentation in this directory
4. Verify service status with `make status`

---

**Ready to get started?**

```bash
make prod
```

Then open http://localhost:3001 to see your monitoring dashboard! 📊
