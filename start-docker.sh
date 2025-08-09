#!/bin/bash

# A-Z Plan Docker Start Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[DOCKER]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[DOCKER]${NC} $1"
}

error() {
    echo -e "${RED}[DOCKER]${NC} $1"
    exit 1
}

check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker >/dev/null 2>&1; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    if ! docker info >/dev/null 2>&1; then
        error "Docker daemon is not running. Please start Docker first."
    fi
    
    log "Prerequisites check passed."
}

wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    log "Waiting for $service to be healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps | grep -q "$service.*healthy"; then
            log "$service is healthy!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    error "$service failed to become healthy within $((max_attempts * 2)) seconds"
}

pull_ollama_model() {
    log "Pulling Ollama model (llama3.2:latest)..."
    docker-compose exec -T ollama ollama pull llama3.2:latest || warn "Failed to pull Ollama model, will retry later"
}

main() {
    log "Starting A-Z Plan with Docker..."
    
    check_prerequisites
    
    log "Building and starting services..."
    docker-compose up -d --build
    
    log "Services started. Waiting for health checks..."
    wait_for_service postgres
    wait_for_service ollama
    
    # Pull Ollama model in background
    pull_ollama_model &
    
    log "All services are running!"
    log ""
    log "Access URLs:"
    log "  Frontend: http://localhost:3000"
    log "  Backend API: http://localhost:8000"
    log "  API Docs: http://localhost:8000/docs"
    log "  Database: localhost:5432 (user: azplan, db: azplan)"
    log "  Ollama: http://localhost:11434"
    log ""
    log "To stop services, run: ./stop-docker.sh"
    log "To view logs, run: docker-compose logs -f"
}

main "$@"