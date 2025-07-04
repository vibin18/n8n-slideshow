# Variables
APP_NAME := slideshow
DOCKER_IMAGE := slideshow-api
DOCKER_TAG := latest
BACKEND_PORT := 7070
FRONTEND_PORT := 3000

# Default target
.PHONY: all
all: build

# Clean build artifacts
.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	@rm -rf frontend/build
	@rm -rf backend/slideshow-server
	@echo "Clean complete"

# Install dependencies
.PHONY: deps
deps:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Frontend dependencies installed"
	@echo "Installing backend dependencies..."
	cd backend && go mod tidy
	@echo "Backend dependencies installed"

# Build frontend
.PHONY: build-frontend
build-frontend:
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "Frontend build complete"

# Build backend
.PHONY: build-backend
build-backend:
	@echo "Building backend..."
	cd backend && go build -o slideshow-server
	@echo "Backend build complete"

# Build everything
.PHONY: build
build: deps build-frontend build-backend
	@echo "Build complete"

# Run the application locally (development mode with both servers)
.PHONY: run
run:
	@echo "Starting development servers..."
	@echo "Frontend will be available on port $(FRONTEND_PORT)"
	@echo "Backend API will be available on port $(BACKEND_PORT)"
	./start.sh

# Build Docker image
.PHONY: docker-build
docker-build:
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE):$(DOCKER_TAG) .
	@echo "Docker image build complete"

# Run Docker container (production mode - single server)
.PHONY: docker-run
docker-run:
	@echo "Running Docker container in production mode..."
	@echo "Application will be available on port $(BACKEND_PORT)"
	@echo "Note: In production mode, both frontend and API are served on the same port"
	docker run -d -p $(BACKEND_PORT):$(BACKEND_PORT) --name $(APP_NAME) $(DOCKER_IMAGE):$(DOCKER_TAG)

# Stop Docker container
.PHONY: docker-stop
docker-stop:
	@echo "Stopping Docker container..."
	docker stop $(APP_NAME) || true
	docker rm $(APP_NAME) || true

# Development - run frontend and backend separately
.PHONY: dev-frontend
dev-frontend:
	@echo "Starting frontend development server on port $(FRONTEND_PORT)..."
	cd frontend && npm start

.PHONY: dev-backend
dev-backend:
	@echo "Starting backend development server on port $(BACKEND_PORT)..."
	cd backend && go run .

# Deploy to Docker (build and run)
.PHONY: deploy
deploy: docker-stop docker-build docker-run

# Help target
.PHONY: help
help:
	@echo "Slideshow API Makefile"
	@echo "Usage:"
	@echo "  make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  all            Build everything (default)"
	@echo "  clean          Clean build artifacts"
	@echo "  deps           Install dependencies"
	@echo "  build          Build frontend and backend"
	@echo "  build-frontend Build only the frontend"
	@echo "  build-backend  Build only the backend"
	@echo "  run            Run the application locally"
	@echo "  docker-build   Build Docker image"
	@echo "  docker-run     Run Docker container"
	@echo "  docker-stop    Stop Docker container"
	@echo "  dev-frontend   Run frontend development server"
	@echo "  dev-backend    Run backend development server"
	@echo "  deploy         Build and run Docker container"
	@echo "  help           Show this help message"
