from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    order: int = 0
    cost: float = 0.0
    revenue: float = 0.0
    support_target: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    cost: Optional[float] = None
    revenue: Optional[float] = None
    support_target: Optional[str] = None
    is_completed: Optional[bool] = None

class Task(TaskBase):
    id: int
    plan_id: int
    is_completed: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Project schemas
class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class Project(ProjectBase):
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProjectWithPlans(Project):
    plans: List['Plan'] = []

# Plan schemas
class PlanBase(BaseModel):
    plan_letter: str
    title: str
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class PlanCreate(PlanBase):
    pass

class PlanUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class Plan(PlanBase):
    id: int
    project_id: int
    created_at: datetime
    updated_at: datetime
    tasks: List[Task] = []
    
    class Config:
        from_attributes = True

class PlanWithStats(Plan):
    total_cost: float
    total_revenue: float
    task_count: int
    completed_task_count: int

# Comment schemas
class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    plan_id: int

class Comment(CommentBase):
    id: int
    plan_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    user: User
    
    class Config:
        from_attributes = True

# API Token schemas
class APITokenBase(BaseModel):
    name: str

class APITokenCreate(APITokenBase):
    pass

class APIToken(APITokenBase):
    id: int
    token: str
    is_active: bool
    created_at: datetime
    last_used_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Shared Link schemas
class SharedLinkBase(BaseModel):
    plan_id: int

class SharedLinkCreate(SharedLinkBase):
    expires_at: Optional[datetime] = None

class SharedLink(SharedLinkBase):
    id: int
    share_token: str
    is_active: bool
    expires_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Statistics schemas
class PlanStatistics(BaseModel):
    highest_cost_plan: Optional[str] = None
    lowest_cost_plan: Optional[str] = None
    longest_duration_plan: Optional[str] = None
    shortest_duration_plan: Optional[str] = None
    total_plans: int
    completed_tasks: int
    total_tasks: int

# LLM schemas
class LLMGenerationRequest(BaseModel):
    plan_z_content: str
    existing_plans: Optional[List[Plan]] = []

class LLMGenerationResponse(BaseModel):
    generated_plans: List[PlanCreate]

# Forward reference resolution
ProjectWithPlans.model_rebuild()