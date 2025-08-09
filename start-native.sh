#!/bin/bash

# A-Z Plan Native Start Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$SCRIPT_DIR/logs"
PID_DIR="$SCRIPT_DIR/pids"

log() {
    echo -e "${GREEN}[NATIVE]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[NATIVE]${NC} $1"
}

error() {
    echo -e "${RED}[NATIVE]${NC} $1"
    exit 1
}

create_dirs() {
    mkdir -p "$LOG_DIR" "$PID_DIR"
}

check_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        return 1
    fi
    return 0
}

install_node() {
    if check_command node && check_command npm; then
        log "Node.js and npm are already installed."
        return 0
    fi
    
    warn "Node.js is not installed. Please install Node.js 18+ and npm."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if check_command brew; then
            log "Installing Node.js via Homebrew..."
            brew install node
        else
            error "Please install Node.js manually from https://nodejs.org/ or install Homebrew first."
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if check_command apt; then
            log "Installing Node.js via apt..."
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif check_command yum; then
            log "Installing Node.js via yum..."
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo yum install -y nodejs npm
        else
            error "Please install Node.js manually from https://nodejs.org/"
        fi
    else
        error "Unsupported OS. Please install Node.js manually from https://nodejs.org/"
    fi
}

install_python() {
    if check_command python3; then
        log "Python 3 is already installed."
        return 0
    fi
    
    warn "Python 3 is not installed. Please install Python 3.8+."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if check_command brew; then
            log "Installing Python via Homebrew..."
            brew install python
        else
            error "Please install Python manually from https://python.org/ or install Homebrew first."
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if check_command apt; then
            log "Installing Python via apt..."
            sudo apt update
            sudo apt install -y python3 python3-pip python3-venv
        elif check_command yum; then
            log "Installing Python via yum..."
            sudo yum install -y python3 python3-pip
        else
            error "Please install Python manually from https://python.org/"
        fi
    else
        error "Unsupported OS. Please install Python manually from https://python.org/"
    fi
}

install_postgresql() {
    if check_command psql && check_command pg_isready; then
        log "PostgreSQL is already installed."
        return 0
    fi
    
    warn "PostgreSQL is not installed. Installing..."
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if check_command brew; then
            log "Installing PostgreSQL via Homebrew..."
            brew install postgresql@15
            brew services start postgresql@15
        else
            error "Please install PostgreSQL manually or install Homebrew first."
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if check_command apt; then
            log "Installing PostgreSQL via apt..."
            sudo apt update
            sudo apt install -y postgresql postgresql-contrib
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        elif check_command yum; then
            log "Installing PostgreSQL via yum..."
            sudo yum install -y postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
        else
            error "Please install PostgreSQL manually."
        fi
    else
        error "Unsupported OS. Please install PostgreSQL manually."
    fi
}

install_ollama() {
    if check_command ollama; then
        log "Ollama is already installed."
        return 0
    fi
    
    warn "Ollama is not installed. Installing..."
    
    log "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    
    if ! check_command ollama; then
        error "Failed to install Ollama. Please install manually from https://ollama.com/"
    fi
}

setup_database() {
    log "Setting up PostgreSQL database..."
    
    # Check if PostgreSQL is running
    if ! pg_isready >/dev/null 2>&1; then
        log "Starting PostgreSQL service..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew services start postgresql@15 || brew services start postgresql
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo systemctl start postgresql
        fi
        
        sleep 3
        
        if ! pg_isready >/dev/null 2>&1; then
            error "Failed to start PostgreSQL service."
        fi
    fi
    
    # Create database and user if they don't exist
    if ! psql -lqt | cut -d \| -f 1 | grep -qw azplan; then
        log "Creating database and user..."
        sudo -u postgres createuser -s azplan 2>/dev/null || createuser -s azplan 2>/dev/null || true
        sudo -u postgres createdb azplan -O azplan 2>/dev/null || createdb azplan -O azplan 2>/dev/null || true
        sudo -u postgres psql -c "ALTER USER azplan PASSWORD 'azplan123';" 2>/dev/null || psql -c "ALTER USER azplan PASSWORD 'azplan123';" 2>/dev/null || true
        log "Database setup completed."
    else
        log "Database already exists."
    fi
}

setup_python_env() {
    log "Setting up Python virtual environment..."
    
    cd "$SCRIPT_DIR/backend"
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
    else
        warn "requirements.txt not found. Installing basic dependencies..."
        pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose bcrypt python-multipart httpx
    fi
    
    cd "$SCRIPT_DIR"
}

setup_frontend() {
    log "Setting up frontend dependencies..."
    
    cd "$SCRIPT_DIR/frontend"
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    cd "$SCRIPT_DIR"
}

start_services() {
    log "Starting services..."
    
    # Start Ollama service
    log "Starting Ollama service..."
    ollama serve > "$LOG_DIR/ollama.log" 2>&1 &
    echo $! > "$PID_DIR/ollama.pid"
    
    # Wait for Ollama to start
    sleep 3
    
    # Pull Ollama model
    log "Pulling Ollama model (this may take a while)..."
    ollama pull llama3.2:latest &
    
    # Start backend
    log "Starting FastAPI backend..."
    cd "$SCRIPT_DIR/backend"
    source venv/bin/activate
    export DATABASE_URL="postgresql://azplan:azplan123@localhost:5432/azplan"
    export OLLAMA_BASE_URL="http://localhost:11434"
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload > "$LOG_DIR/backend.log" 2>&1 &
    echo $! > "$PID_DIR/backend.pid"
    cd "$SCRIPT_DIR"
    
    # Start frontend
    log "Starting React frontend..."
    cd "$SCRIPT_DIR/frontend"
    export REACT_APP_API_URL="http://localhost:8000"
    npm start > "$LOG_DIR/frontend.log" 2>&1 &
    echo $! > "$PID_DIR/frontend.pid"
    cd "$SCRIPT_DIR"
    
    sleep 5
}

main() {
    log "Starting A-Z Plan in native environment..."
    
    create_dirs
    
    log "Checking and installing dependencies..."
    install_node
    install_python
    install_postgresql
    install_ollama
    
    setup_database
    setup_python_env
    setup_frontend
    start_services
    
    log "All services started!"
    log ""
    log "Access URLs:"
    log "  Frontend: http://localhost:3000"
    log "  Backend API: http://localhost:8000"
    log "  API Docs: http://localhost:8000/docs"
    log "  Database: localhost:5432 (user: azplan, db: azplan)"
    log "  Ollama: http://localhost:11434"
    log ""
    log "Log files are in: $LOG_DIR/"
    log "To stop services, run: ./stop-native.sh"
    log ""
    log "Services are starting in the background. Please wait a moment for them to be fully ready."
}

main "$@"