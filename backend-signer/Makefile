.PHONY: help install build test dev start docker-build docker-run deploy-staging deploy-production clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make install          - Install dependencies"
	@echo "  make build           - Build the TypeScript project"
	@echo "  make test            - Run tests"
	@echo "  make test-coverage   - Run tests with coverage"
	@echo "  make dev             - Run in development mode"
	@echo "  make start           - Run in production mode"
	@echo "  make docker-build    - Build Docker image"
	@echo "  make docker-run      - Run Docker container"
	@echo "  make docker-compose  - Run with docker-compose"
	@echo "  make deploy-staging  - Deploy to staging"
	@echo "  make deploy-production - Deploy to production"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make lint            - Run linter"
	@echo "  make format          - Format code"

# Install dependencies
install:
	npm ci

# Build TypeScript
build:
	npm run build
	@echo "Build complete: dist/"

# Run tests
test:
	npm test

# Run tests with coverage
test-coverage:
	npm run test:coverage

# Run in development mode
dev:
	npm run dev

# Run in production mode
start: build
	npm start

# Docker operations
docker-build:
	docker build -t yielddelta/backend-signer:latest .

docker-run: docker-build
	docker run --rm -it \
		--env-file .env \
		-p 3000:3000 \
		yielddelta/backend-signer:latest

docker-compose:
	docker-compose up --build

docker-compose-down:
	docker-compose down

# Deployment
deploy-staging:
	@echo "Deploying to staging..."
	@if [ -z "$$RAILWAY_TOKEN" ]; then \
		echo "Error: RAILWAY_TOKEN is not set"; \
		exit 1; \
	fi
	railway up --service backend-signer-staging

deploy-production:
	@echo "Deploying to production..."
	@echo "This requires manual approval."
	@read -p "Are you sure you want to deploy to production? (y/N) " confirm && \
	if [ "$$confirm" = "y" ] || [ "$$confirm" = "Y" ]; then \
		if [ -z "$$RAILWAY_TOKEN" ]; then \
			echo "Error: RAILWAY_TOKEN is not set"; \
			exit 1; \
		fi; \
		railway up --service backend-signer-production; \
	else \
		echo "Deployment cancelled."; \
	fi

# Railway specific commands
railway-login:
	railway login

railway-link:
	railway link

railway-logs:
	railway logs

# Utility commands
clean:
	rm -rf dist/
	rm -rf node_modules/
	rm -rf coverage/
	rm -rf logs/*.log

lint:
	npm run lint

format:
	npx prettier --write "src/**/*.{ts,tsx,json}"
	npx prettier --write "tests/**/*.{ts,tsx}"

# Environment setup
setup-env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "Created .env file from .env.example"; \
		echo "Please update .env with your configuration"; \
	else \
		echo ".env file already exists"; \
	fi

# Database migrations (if needed)
migrate:
	@echo "No database migrations needed for this service"

# Health check
health-check:
	@curl -f http://localhost:3000/health || echo "Service is not running"

# Logs
logs:
	tail -f logs/combined.log

logs-error:
	tail -f logs/error.log

# Development database (if needed)
db-start:
	@echo "No database needed for this service"

db-stop:
	@echo "No database needed for this service"