.PHONY: help build up down logs clean restart dev prod health metrics status

# Colors for output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

build: ## Build Docker images
	@echo "$(GREEN)Building images...$(NC)"
	docker-compose build

up: ## Start all services (production)
	@echo "$(GREEN)Starting production services...$(NC)"
	docker-compose up -d
	@make status

down: ## Stop all services
	@echo "$(YELLOW)Stopping services...$(NC)"
	docker-compose down

logs: ## View logs from all services
	docker-compose logs -f

logs-app: ## View application logs only
	docker-compose logs -f app

logs-prometheus: ## View Prometheus logs
	docker-compose logs -f prometheus

logs-grafana: ## View Grafana logs
	docker-compose logs -f grafana

clean: ## Stop services and remove volumes
	@echo "$(YELLOW)Cleaning up...$(NC)"
	docker-compose down -v
	docker system prune -f

restart: ## Restart all services
	@echo "$(GREEN)Restarting services...$(NC)"
	docker-compose restart

restart-app: ## Restart application only
	docker-compose restart app

dev: ## Start development environment with hot reload
	@echo "$(GREEN)Starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml up

dev-build: ## Build and start development environment
	@echo "$(GREEN)Building and starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml up --build

dev-down: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

prod: build up ## Build and start production environment

health: ## Check application health
	@echo "$(GREEN)Checking application health...$(NC)"
	@curl -s http://localhost:3000/api/health | jq || echo "Application not responding"

metrics: ## View application metrics
	@echo "$(GREEN)Fetching metrics...$(NC)"
	@curl -s http://localhost:3000/api/metrics

status: ## Show status of all services
	@echo "$(GREEN)Service Status:$(NC)"
	@docker-compose ps
	@echo ""
	@echo "$(GREEN)Access Points:$(NC)"
	@echo "  Application: http://localhost:3000"
	@echo "  Grafana:     http://localhost:3001 (admin/admin)"
	@echo "  Prometheus:  http://localhost:9090"
	@echo "  Metrics:     http://localhost:9100"

shell: ## Open shell in application container
	docker exec -it farcaster-app sh

shell-prometheus: ## Open shell in Prometheus container
	docker exec -it prometheus sh

shell-grafana: ## Open shell in Grafana container
	docker exec -it grafana sh

ps: ## List running containers
	docker-compose ps

pull: ## Pull latest images
	docker-compose pull

backup-prometheus: ## Backup Prometheus data
	@echo "$(GREEN)Backing up Prometheus data...$(NC)"
	docker run --rm -v prometheus_data:/data -v $(PWD):/backup alpine tar czf /backup/prometheus-backup-$$(date +%Y%m%d-%H%M%S).tar.gz /data

backup-grafana: ## Backup Grafana data
	@echo "$(GREEN)Backing up Grafana data...$(NC)"
	docker run --rm -v grafana_data:/data -v $(PWD):/backup alpine tar czf /backup/grafana-backup-$$(date +%Y%m%d-%H%M%S).tar.gz /data

test-metrics: ## Test if metrics endpoint is working
	@echo "$(GREEN)Testing metrics endpoint...$(NC)"
	@curl -s http://localhost:3000/api/metrics | head -20
	@echo ""
	@echo "$(GREEN)✓ Metrics endpoint is working$(NC)"

open-grafana: ## Open Grafana in browser
	@open http://localhost:3001 || xdg-open http://localhost:3001 || echo "Please open http://localhost:3001"

open-prometheus: ## Open Prometheus in browser
	@open http://localhost:9090 || xdg-open http://localhost:9090 || echo "Please open http://localhost:9090"

open-app: ## Open application in browser
	@open http://localhost:3000 || xdg-open http://localhost:3000 || echo "Please open http://localhost:3000"

scale: ## Scale application (usage: make scale n=3)
	docker-compose up -d --scale app=$(n)

update: pull up ## Update and restart all services

.DEFAULT_GOAL := help
