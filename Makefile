.PHONY: help install dev worker build test lint clean docker-up docker-down docker-logs migrate seed studio

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	npm install

dev: ## Start API in development mode
	npm run dev

worker: ## Start workers
	npm run worker

build: ## Build TypeScript
	npm run build

test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage
	npm run test:coverage

lint: ## Run ESLint
	npm run lint

migrate: ## Run database migrations
	npm run db:migrate

seed: ## Seed database with sample data
	npm run db:seed

studio: ## Open Prisma Studio
	npm run db:studio

docker-up: ## Start all services with Docker Compose
	docker-compose up -d

docker-down: ## Stop all services
	docker-compose down

docker-logs: ## Show logs from Docker containers
	docker-compose logs -f

docker-build: ## Build Docker images
	docker-compose build

docker-clean: ## Remove containers and volumes
	docker-compose down -v

clean: ## Clean build artifacts
	rm -rf dist coverage node_modules

setup: install migrate seed ## Initial setup (install + migrate + seed)

dev-full: docker-up ## Start full development environment
	@echo "Waiting for services to be ready..."
	@sleep 5
	@echo "Running migrations..."
	npm run db:migrate
	@echo "Seeding database..."
	npm run db:seed
	@echo "\n[OK] Development environment ready!"
	@echo "API: http://localhost:3000"
	@echo "Prisma Studio: make studio"
