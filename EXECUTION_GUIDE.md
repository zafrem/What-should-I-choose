# Execution Guide

This guide covers how to run, manage, and troubleshoot the A-Z Plan Project Management System.

## Quick Start

### Option 1: Docker Environment (Recommended)

```bash
# Start all services with Docker
./start.sh --docker

# Or use the direct Docker script
./start-docker.sh

# Stop services
./stop.sh --docker
# or
./stop-docker.sh
```

### Option 2: Native Environment

```bash
# Start services natively (will install dependencies)
./start.sh --native

# Or use the direct native script
./start-native.sh

# Stop services
./stop.sh --native
# or
./stop-native.sh
```

### Option 3: Auto-detection

```bash
# Let the script detect your environment
./start.sh

# Stop all services
./stop.sh
```

## Development

### Prerequisites (Native Setup)
- Node.js 18+ and npm 9+ or Yarn 1.22+
- Python 3.8+ with pip and virtualenv
- PostgreSQL 12+
- Ollama with llama3.2 model

### Docker Setup
- Docker & Docker Compose

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Build frontend
cd frontend
npm run build

# Build Docker images
docker-compose build --no-cache
```

## Troubleshooting

### Common Issues

1. **Ollama Model Not Found**
   ```bash
   # Pull the required model
   ollama pull llama3.2:latest
   ```

2. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   pg_isready -h localhost -p 5432
   ```

3. **Port Already in Use**
   ```bash
   # Find and kill processes using ports
   lsof -ti:3000 | xargs kill -9  # Frontend
   lsof -ti:8000 | xargs kill -9  # Backend
   lsof -ti:5432 | xargs kill -9  # PostgreSQL
   ```

4. **Docker Issues**
   ```bash
   # Reset Docker environment
   docker-compose down -v
   docker system prune -f
   docker-compose up --build
   ```

### Log Files (Native Environment)

- Frontend: `logs/frontend.log`
- Backend: `logs/backend.log`
- Ollama: `logs/ollama.log`

### Health Checks

- Backend health: `GET /health`
- Database: `pg_isready -h localhost -p 5432`
- Ollama: `curl http://localhost:11434/api/version`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Note**: The first startup may take longer as Docker images are built and Ollama models are downloaded. Subsequent starts will be much faster.