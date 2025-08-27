from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc
from datetime import datetime, timedelta
from typing import List, Optional
import secrets
import uuid

from database import SessionLocal, engine, get_db
from models import Base, User as UserModel, Project as ProjectModel, Plan as PlanModel, Task as TaskModel, Comment as CommentModel, APIToken as APITokenModel, SharedLink as SharedLinkModel
from schemas import (
    User, UserCreate, UserLogin, Project, ProjectCreate, ProjectUpdate, ProjectWithPlans,
    Plan, PlanCreate, PlanUpdate, PlanWithStats,
    Task, TaskCreate, TaskUpdate, Comment, CommentCreate, APIToken, APITokenCreate,
    SharedLink, SharedLinkCreate, Token, TokenData, PlanStatistics,
    LLMGenerationRequest, LLMGenerationResponse
)
from auth import (
    authenticate_user, create_access_token, get_current_active_user,
    get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
)
from ollama_service import ollama_service
from routers import projects, plans

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="A-Z Plan API", version="1.0.0")

# Include routers
app.include_router(projects.router)
app.include_router(plans.router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth endpoints
@app.post("/auth/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(
        (UserModel.username == user.username) | (UserModel.email == user.email)
    ).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username or email already registered"
        )
    
    hashed_password = get_password_hash(user.password)
    db_user = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create default Plan A
    plan_a = PlanModel(
        plan_letter="A",
        title="Plan A - Starting Point",
        description="This is your starting point. Plan A represents where you are now.",
        owner_id=db_user.id
    )
    db.add(plan_a)
    db.commit()
    
    return db_user

@app.post("/auth/login", response_model=Token)
def login_for_access_token(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

# API Token endpoints
@app.post("/api-tokens", response_model=APIToken)
def create_api_token(
    token_data: APITokenCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    token = secrets.token_urlsafe(32)
    db_token = APITokenModel(
        user_id=current_user.id,
        token=token,
        name=token_data.name
    )
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token

@app.get("/api-tokens", response_model=List[APIToken])
def list_api_tokens(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(APITokenModel).filter(APITokenModel.user_id == current_user.id).all()

@app.delete("/api-tokens/{token_id}")
def delete_api_token(
    token_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    token = db.query(APITokenModel).filter(
        APITokenModel.id == token_id,
        APITokenModel.user_id == current_user.id
    ).first()
    if not token:
        raise HTTPException(status_code=404, detail="API token not found")
    
    db.delete(token)
    db.commit()
    return {"message": "API token deleted"}

# Plan endpoints
@app.get("/plans", response_model=List[PlanWithStats])
def read_plans(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plans = db.query(PlanModel).filter(PlanModel.owner_id == current_user.id).order_by(PlanModel.plan_letter).all()
    
    plans_with_stats = []
    for plan in plans:
        total_cost = sum(task.cost for task in plan.tasks)
        total_revenue = sum(task.revenue for task in plan.tasks)
        task_count = len(plan.tasks)
        completed_task_count = sum(1 for task in plan.tasks if task.is_completed)
        
        plan_with_stats = PlanWithStats(
            **plan.__dict__,
            total_cost=total_cost,
            total_revenue=total_revenue,
            task_count=task_count,
            completed_task_count=completed_task_count
        )
        plans_with_stats.append(plan_with_stats)
    
    return plans_with_stats

@app.post("/plans", response_model=Plan)
def create_plan(
    plan: PlanCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if plan letter already exists for user
    existing_plan = db.query(PlanModel).filter(
        PlanModel.owner_id == current_user.id,
        PlanModel.plan_letter == plan.plan_letter
    ).first()
    
    if existing_plan:
        raise HTTPException(status_code=400, detail="Plan with this letter already exists")
    
    # Validate plan letter
    if plan.plan_letter not in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        raise HTTPException(status_code=400, detail="Invalid plan letter")
    
    db_plan = PlanModel(**plan.dict(), owner_id=current_user.id)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@app.get("/plans/{plan_id}", response_model=Plan)
def read_plan(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.owner_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@app.put("/plans/{plan_id}", response_model=Plan)
def update_plan(
    plan_id: int,
    plan_update: PlanUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.owner_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Don't allow editing Plan A title
    if plan.plan_letter == "A" and plan_update.title is not None:
        raise HTTPException(status_code=400, detail="Plan A title cannot be changed")
    
    update_data = plan_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)
    
    db.commit()
    db.refresh(plan)
    return plan

@app.delete("/plans/{plan_id}")
def delete_plan(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.owner_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Don't allow deleting Plan A
    if plan.plan_letter == "A":
        raise HTTPException(status_code=400, detail="Plan A cannot be deleted")
    
    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted"}

# Task endpoints
@app.post("/plans/{plan_id}/tasks", response_model=Task)
def create_task(
    plan_id: int,
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.owner_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    db_task = TaskModel(**task.dict(), plan_id=plan_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.get("/plans/{plan_id}/tasks", response_model=List[Task])
def read_tasks(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.owner_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return db.query(TaskModel).filter(TaskModel.plan_id == plan_id).order_by(TaskModel.order).all()

@app.put("/tasks/{task_id}", response_model=Task)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).join(PlanModel).filter(
        TaskModel.id == task_id,
        PlanModel.owner_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)
    
    db.commit()
    db.refresh(task)
    return task

@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task = db.query(TaskModel).join(PlanModel).filter(
        TaskModel.id == task_id,
        PlanModel.owner_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

# LLM Generation endpoints
@app.post("/plans/generate-from-z", response_model=List[Plan])
async def generate_plans_from_z(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get Plan Z
    plan_z = db.query(PlanModel).filter(
        PlanModel.owner_id == current_user.id,
        PlanModel.plan_letter == "Z"
    ).first()
    
    if not plan_z:
        raise HTTPException(status_code=404, detail="Plan Z not found")
    
    if not plan_z.description:
        raise HTTPException(status_code=400, detail="Plan Z must have content/description")
    
    # Get existing plans B-Y
    existing_plans = db.query(PlanModel).filter(
        PlanModel.owner_id == current_user.id,
        PlanModel.plan_letter.in_("BCDEFGHIJKLMNOPQRSTUVWXY")
    ).all()
    
    # Generate new plans
    generated_plan_creates = await ollama_service.generate_plans(
        plan_z.description, existing_plans
    )
    
    created_plans = []
    for plan_create in generated_plan_creates:
        # Check if plan already exists
        existing = db.query(PlanModel).filter(
            PlanModel.owner_id == current_user.id,
            PlanModel.plan_letter == plan_create.plan_letter
        ).first()
        
        if existing:
            # Update existing plan
            for key, value in plan_create.dict(exclude_unset=True).items():
                setattr(existing, key, value)
            created_plans.append(existing)
        else:
            # Create new plan
            db_plan = PlanModel(**plan_create.dict(), owner_id=current_user.id)
            db.add(db_plan)
            created_plans.append(db_plan)
    
    db.commit()
    for plan in created_plans:
        db.refresh(plan)
    
    return created_plans

# Statistics endpoints
@app.get("/statistics", response_model=PlanStatistics)
def get_statistics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plans = db.query(PlanModel).filter(PlanModel.owner_id == current_user.id).all()
    
    if not plans:
        return PlanStatistics(
            total_plans=0,
            completed_tasks=0,
            total_tasks=0
        )
    
    # Calculate plan costs and durations
    plan_costs = []
    plan_durations = []
    
    for plan in plans:
        total_cost = sum(task.cost for task in plan.tasks)
        if total_cost > 0:
            plan_costs.append((plan.plan_letter, total_cost))
        
        if plan.start_date and plan.end_date:
            duration = (plan.end_date - plan.start_date).days
            plan_durations.append((plan.plan_letter, duration))
    
    # Find extremes
    highest_cost_plan = max(plan_costs, key=lambda x: x[1])[0] if plan_costs else None
    lowest_cost_plan = min(plan_costs, key=lambda x: x[1])[0] if plan_costs else None
    longest_duration_plan = max(plan_durations, key=lambda x: x[1])[0] if plan_durations else None
    shortest_duration_plan = min(plan_durations, key=lambda x: x[1])[0] if plan_durations else None
    
    # Count tasks
    total_tasks = sum(len(plan.tasks) for plan in plans)
    completed_tasks = sum(sum(1 for task in plan.tasks if task.is_completed) for plan in plans)
    
    return PlanStatistics(
        highest_cost_plan=highest_cost_plan,
        lowest_cost_plan=lowest_cost_plan,
        longest_duration_plan=longest_duration_plan,
        shortest_duration_plan=shortest_duration_plan,
        total_plans=len(plans),
        completed_tasks=completed_tasks,
        total_tasks=total_tasks
    )

# Comment endpoints
@app.post("/comments", response_model=Comment)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if user has access to the plan (owner or shared)
    plan = db.query(PlanModel).filter(PlanModel.id == comment.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan.owner_id != current_user.id:
        # Check if plan is shared
        shared_link = db.query(SharedLinkModel).filter(
            SharedLinkModel.plan_id == comment.plan_id,
            SharedLinkModel.is_active == True
        ).first()
        if not shared_link:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db_comment = CommentModel(**comment.dict(), user_id=current_user.id)
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    return db_comment

@app.get("/plans/{plan_id}/comments", response_model=List[Comment])
def read_comments(
    plan_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check access
    plan = db.query(PlanModel).filter(PlanModel.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan.owner_id != current_user.id:
        shared_link = db.query(SharedLinkModel).filter(
            SharedLinkModel.plan_id == plan_id,
            SharedLinkModel.is_active == True
        ).first()
        if not shared_link:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return db.query(CommentModel).filter(CommentModel.plan_id == plan_id).order_by(desc(CommentModel.created_at)).all()

# Shared Link endpoints
@app.post("/plans/{plan_id}/share", response_model=SharedLink)
def create_shared_link(
    plan_id: int,
    share_data: SharedLinkCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.owner_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    share_token = str(uuid.uuid4())
    db_shared_link = SharedLinkModel(
        plan_id=plan_id,
        owner_id=current_user.id,
        share_token=share_token,
        expires_at=share_data.expires_at
    )
    db.add(db_shared_link)
    db.commit()
    db.refresh(db_shared_link)
    return db_shared_link

@app.get("/shared/{share_token}")
def get_shared_plan(share_token: str, db: Session = Depends(get_db)):
    shared_link = db.query(SharedLinkModel).filter(
        SharedLinkModel.share_token == share_token,
        SharedLinkModel.is_active == True
    ).first()
    
    if not shared_link:
        raise HTTPException(status_code=404, detail="Shared link not found")
    
    if shared_link.expires_at and shared_link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Shared link has expired")
    
    plan = db.query(PlanModel).filter(PlanModel.id == shared_link.plan_id).first()
    return plan

# Health check
@app.get("/health")
async def health_check():
    ollama_healthy = await ollama_service.health_check()
    return {
        "status": "healthy",
        "ollama": "healthy" if ollama_healthy else "unhealthy"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)