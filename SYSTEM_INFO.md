# A-Z Plan Project

A comprehensive planning application that helps you create structured plans from A to Z, with AI-powered generation and real-time collaboration features.

## Features

### 🔐 Authentication System
- User registration and login
- JWT-based authentication
- API token generation for programmatic access

### 📋 Plan Management
- **Plan A**: Starting point (non-editable)
- **Plans B-Y**: Intermediate steps (fully editable)
- **Plan Z**: Ultimate goal (special plan for AI generation)
- Task management with cost/revenue tracking
- Drag-and-drop task ordering

### 🤖 AI-Powered Generation
- Auto-generate Plans B-Y from Plan Z using Ollama
- Intelligent planning suggestions
- Fallback generation when LLM is unavailable

### 🤝 Collaboration Features
- Real-time comments on plans
- Shareable links for external collaboration
- User permissions and access control

### 📊 Analytics & Statistics
- Plan completion tracking
- Cost/revenue analysis
- Duration statistics
- Visual progress indicators

## Tech Stack

- **Frontend**: React 18, Material-UI v5, Recharts 2.x, React Router v6
- **Backend**: FastAPI 0.100+ (Python), SQLAlchemy 2.x, Pydantic v2
- **AI**: Ollama (Local LLM) with llama3.2 model
- **Database**: PostgreSQL 12+
- **Authentication**: JWT with refresh tokens
- **Containerization**: Docker & Docker Compose

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
2. Create **Plan Z** first - this represents your ultimate goal
3. Add detailed description to Plan Z for AI generation
4. Create intermediate plans (B-Y) manually or use AI generation

### 2. AI Generation

1. Write a comprehensive description in Plan Z
2. Click "Generate B-Y" button in the main interface
3. The system will create intermediate plans leading to your goal
4. Edit and customize the generated plans as needed

### 3. Task Management

- Add tasks to each plan with cost/revenue tracking
- Set task order and completion status
- Track progress with visual indicators
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

### Plans
- `GET /plans` - List all plans
- `POST /plans` - Create new plan
- `GET /plans/{id}` - Get plan details
- `PUT /plans/{id}` - Update plan
- `DELETE /plans/{id}` - Delete plan
- `POST /plans/generate-from-z` - Generate plans from Z

### Tasks
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

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review logs in the `logs/` directory
3. Open an issue on the project repository