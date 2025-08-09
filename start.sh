#!/bin/bash

# A-Z Plan Main Start Script
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
    echo "If no option is provided, the script will auto-detect the environment."
}

log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

check_docker() {
    if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
        if docker info >/dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

detect_environment() {
    if check_docker; then
        echo "docker"
    else
        echo "native"
    fi
}

case "${1:-}" in
    --docker)
        ENVIRONMENT="docker"
        ;;
    --native)
        ENVIRONMENT="native"
        ;;
    --help)
        print_usage
        exit 0
        ;;
    "")
        ENVIRONMENT=$(detect_environment)
        log "Auto-detected environment: $ENVIRONMENT"
        ;;
    *)
        error "Unknown option: $1"
        print_usage
        exit 1
        ;;
esac

log "Starting A-Z Plan in $ENVIRONMENT environment..."

if [ "$ENVIRONMENT" = "docker" ]; then
    if ! check_docker; then
        error "Docker is not available or not running. Please install Docker or use --native option."
    fi
    exec ./start-docker.sh
else
    exec ./start-native.sh
fi