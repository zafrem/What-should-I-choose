#!/bin/bash

# A-Z Plan Docker Stop Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

main() {
    log "Stopping A-Z Plan Docker services..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down
        log "All Docker services stopped."
        
        # Offer to remove volumes
        read -p "Remove data volumes? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker-compose down -v
            log "Data volumes removed."
        fi
    else
        warn "docker-compose.yml not found. No services to stop."
    fi
    
    log "Docker environment stopped."
}

main "$@"