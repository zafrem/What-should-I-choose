#!/bin/bash

# A-Z Plan Main Stop Script
# Supports both Docker and native environments

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_usage() {
    echo "Usage: $0 [--docker|--native|--help]"
    echo ""
    echo "Options:"
    echo "  --docker    Force Docker environment"
    echo "  --native    Force native environment"
    echo "  --help      Show this help message"
    echo ""
    echo "If no option is provided, the script will stop both environments."
}

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

case "${1:-}" in
    --docker)
        log "Stopping Docker environment..."
        exec ./stop-docker.sh
        ;;
    --native)
        log "Stopping native environment..."
        exec ./stop-native.sh
        ;;
    --help)
        print_usage
        exit 0
        ;;
    "")
        log "Stopping all A-Z Plan services..."
        # Stop both environments to be safe
        if [ -x "./stop-docker.sh" ]; then
            log "Stopping Docker services..."
            ./stop-docker.sh || warn "Failed to stop Docker services (may not be running)"
        fi
        if [ -x "./stop-native.sh" ]; then
            log "Stopping native services..."
            ./stop-native.sh || warn "Failed to stop native services (may not be running)"
        fi
        log "All services stopped."
        ;;
    *)
        error "Unknown option: $1"
        print_usage
        exit 1
        ;;
esac