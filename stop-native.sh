#!/bin/bash

# A-Z Plan Native Stop Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_DIR="$SCRIPT_DIR/pids"

log() {
    echo -e "${GREEN}[NATIVE]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[NATIVE]${NC} $1"
}

error() {
    echo -e "${RED}[NATIVE]${NC} $1"
}

stop_service() {
    local service_name=$1
    local pid_file="$PID_DIR/$service_name.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            log "Stopping $service_name (PID: $pid)..."
            kill "$pid"
            
            # Wait for graceful shutdown
            local count=0
            while kill -0 "$pid" 2>/dev/null && [ $count -lt 10 ]; do
                sleep 1
                count=$((count + 1))
            done
            
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                warn "Force killing $service_name..."
                kill -9 "$pid" 2>/dev/null || true
            fi
            
            log "$service_name stopped."
        else
            warn "$service_name was not running (stale PID file)."
        fi
        rm -f "$pid_file"
    else
        log "$service_name PID file not found."
    fi
}

stop_by_port() {
    local service_name=$1
    local port=$2
    
    log "Checking for $service_name processes on port $port..."
    
    local pids=$(lsof -ti:$port 2>/dev/null || true)
    
    if [ -n "$pids" ]; then
        log "Found $service_name processes: $pids"
        for pid in $pids; do
            if kill -0 "$pid" 2>/dev/null; then
                log "Stopping $service_name (PID: $pid)..."
                kill "$pid" 2>/dev/null || true
                sleep 1
                
                # Force kill if still running
                if kill -0 "$pid" 2>/dev/null; then
                    kill -9 "$pid" 2>/dev/null || true
                fi
            fi
        done
        log "$service_name processes stopped."
    else
        log "No $service_name processes found on port $port."
    fi
}

cleanup_processes() {
    log "Cleaning up any remaining processes..."
    
    # Kill any uvicorn processes
    pkill -f "uvicorn.*main:app" 2>/dev/null || true
    
    # Kill any npm start processes for this project
    pkill -f "npm.*start" 2>/dev/null || true
    
    # Kill any ollama serve processes
    pkill -f "ollama serve" 2>/dev/null || true
    
    log "Process cleanup completed."
}

main() {
    log "Stopping A-Z Plan native services..."
    
    # Stop services by PID files
    stop_service "frontend"
    stop_service "backend" 
    stop_service "ollama"
    
    # Stop services by port (fallback)
    stop_by_port "frontend" "3000"
    stop_by_port "backend" "8000"
    stop_by_port "ollama" "11434"
    
    # Final cleanup
    cleanup_processes
    
    # Clean up PID directory
    if [ -d "$PID_DIR" ]; then
        rm -rf "$PID_DIR"
        log "Cleaned up PID directory."
    fi
    
    log "All native services stopped."
    
    # Offer to stop PostgreSQL
    read -p "Stop PostgreSQL service? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Stopping PostgreSQL..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew services stop postgresql@15 2>/dev/null || brew services stop postgresql 2>/dev/null || true
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo systemctl stop postgresql 2>/dev/null || true
        fi
        log "PostgreSQL stopped."
    fi
    
    log "Native environment stopped."
}

main "$@"