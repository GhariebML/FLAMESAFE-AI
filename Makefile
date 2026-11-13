.PHONY: help setup dev build test lint clean docker-up docker-down seed validate

help:
	@echo "FlameSafe AI - Monorepo Management Commands"
	@echo "----------------------------------------------------"
	@echo "  make setup        : Install dependencies for backend and frontend"
	@echo "  make dev          : Start backend and frontend in local development mode"
	@echo "  make docker-up    : Start all services via Docker Compose (PostgreSQL, Backend, Frontend)"
	@echo "  make docker-down  : Stop Docker Compose services"
	@echo "  make test         : Run backend and frontend test suites"
	@echo "  make lint         : Run code formatters and linters"
	@echo "  make seed         : Seed initial NASA combustion datasets into database"
	@echo "  make validate     : Run end-to-end verification and health check"
	@echo "  make clean        : Clean cache directories and build artifacts"

setup:
	@echo "Setting up backend..."
	cd backend && python -m pip install -r requirements.txt || poetry install
	@echo "Setting up frontend..."
	cd frontend && npm install

dev-backend:
	cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-frontend:
	cd frontend && npm run dev

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

test:
	@echo "Running backend tests..."
	cd backend && pytest
	@echo "Running frontend tests..."
	cd frontend && npm test --if-present

lint:
	cd backend && ruff check .
	cd frontend && npm run lint --if-present

seed:
	cd backend && python -m scripts.seed_data

validate:
	python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/api/v1/health').read().decode())"

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".next" -exec rm -rf {} +
