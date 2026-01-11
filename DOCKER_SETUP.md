# Docker + Prometheus + Grafana

This repo can be run locally with Docker Compose, including a Prometheus + Grafana stack.

## What you get

- **App**: `http://localhost:3000`
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001` (login: `admin` / `admin`)
- **Metrics endpoint**: `http://localhost:3000/api/metrics`

## Run it

1) Create an `.env` file (copy from `env.example` if needed) and add any required keys (e.g. Neynar).

2) Start everything:

```bash
docker compose up --build
```

## Prometheus scrape config

Prometheus is configured to scrape:

- `app:3000/api/metrics`

Config lives at `monitoring/prometheus/prometheus.yml`.

## Grafana provisioning

Grafana auto-provisions:

- a **Prometheus datasource** pointing at `http://prometheus:9090`
- a starter dashboard under `monitoring/grafana/dashboards/`

