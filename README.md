# A-Z Plan Project

A comprehensive project management application that helps you create projects with structured plans from A to Z, featuring AI-powered generation and real-time collaboration.

## Features

### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- API token generation for programmatic access

### 📂 Project & Plan Management
- **Projects**: Create unlimited projects with custom titles and descriptions
- **Plan Hierarchy**: Each project can contain Plans A-Z (26 plans maximum)
  - **Plan A**: Most detailed and best form with low cost - your starting point
  - **Plans B-Y**: Intermediate steps and variations (fully editable)
  - **Plan Z**: Almost giving up option - your fallback plan
- **Manual Plan Creation**: Add only the plans you need (A-Z as required)
- **Task Management**: Add tasks to each plan with cost/revenue tracking
- **Progress Tracking**: Visual indicators for plan and task completion

### 🤖 AI-Powered Generation
- Auto-generate Plans B-Y from Plan Z using Ollama
- Intelligent planning suggestions within each project
- Fallback generation when LLM is unavailable

### 🤝 Collaboration Features
- Real-time comments on plans within projects
- Shareable links for external collaboration
- User permissions and access control

### 📊 Analytics & Statistics
- Project and plan completion tracking
- Cost/revenue analysis per project
- Project duration statistics
- Visual progress indicators for plans and tasks

## Tech Stack

- **Frontend**: React 18, Material-UI v5, Recharts 2.x, React Router v6
- **Backend**: FastAPI 0.100+ (Python), SQLAlchemy 2.x, Pydantic v2
- **AI**: Ollama (Local LLM) with llama3.2 model
- **Database**: PostgreSQL 12+
- **Authentication**: JWT with refresh tokens
- **Containerization**: Docker & Docker Compose

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

## Access URLs

After starting the services:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432 (user: azplan, db: azplan, password: azplan123)
- **Ollama**: http://localhost:11434

## Project Structure

```
a-z-plan/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── services/      # API service layer
│   ├── package.json
│   └── Dockerfile
├── backend/               # FastAPI server
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── main.py           # FastAPI application
│   ├── auth.py           # Authentication logic
│   ├── database.py       # Database configuration
│   ├── ollama_service.py # LLM integration
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml     # Multi-service orchestration
├── start.sh              # Main start script
├── stop.sh               # Main stop script
├── start-docker.sh       # Docker-specific start
├── stop-docker.sh        # Docker-specific stop
├── start-native.sh       # Native environment start
├── stop-native.sh        # Native environment stop
└── README.md
```

## Usage Guide

### 1. Getting Started

1. Register a new account or login
2. **Create a Project** - Give it a meaningful title and description
3. **Add Plans** - Click "Create Plans" to add Plans A-Z as needed
   - **Plan A**: Your detailed, best-case scenario
   - **Plan Z**: Your fallback/worst-case option
   - **Plans B-Y**: Intermediate variations
4. Add detailed descriptions to plans for AI generation

### 2. AI Generation

1. Within a project, write a comprehensive description in Plan Z
2. Click "Generate B-Y from Z" button in the project interface
3. The system will create intermediate plans (B-Y) leading from Plan Z
4. Edit and customize the generated plans as needed

### 3. Task Management

- Add tasks to each plan within your projects
- Track costs and revenue for each task
- Set task order and completion status
- Monitor progress with visual indicators
- Add support targets for accountability

### 4. Collaboration

- Generate shareable links for plans
- Allow external users to comment (login required)
- Track all comments and discussions
- Real-time updates for collaborative planning

### 5. API Access

- Generate API tokens in user settings
- Use RESTful API for integrations
- Full CRUD operations available
- Comprehensive API documentation at `/docs`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Projects
- `GET /projects` - List all projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `PUT /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

### Plans (within Projects)
- `GET /projects/{project_id}/plans` - List all plans in a project
- `POST /projects/{project_id}/plans` - Create new plan in project
- `GET /projects/{project_id}/plans/{plan_id}` - Get plan details
- `PUT /projects/{project_id}/plans/{plan_id}` - Update plan
- `DELETE /projects/{project_id}/plans/{plan_id}` - Delete plan
- `POST /plans/generate-from-z` - Generate plans from Z

### Tasks (within Plans)
- `POST /plans/{plan_id}/tasks` - Create task
- `GET /plans/{plan_id}/tasks` - List tasks
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### Statistics & Analytics
- `GET /statistics` - Get comprehensive statistics

### Comments & Collaboration
- `POST /comments` - Add comment
- `GET /plans/{id}/comments` - Get plan comments
- `POST /plans/{id}/share` - Create share link

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT signing key
- `OLLAMA_BASE_URL`: Ollama service URL

### Frontend
- `REACT_APP_API_URL`: Backend API URL

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

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs in the `logs/` directory
3. Open an issue on the project repository

---

**Note**: The first startup may take longer as Docker images are built and Ollama models are downloaded. Subsequent starts will be much faster.