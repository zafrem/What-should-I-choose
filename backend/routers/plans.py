from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Project as ProjectModel, Plan as PlanModel, User
from schemas import Plan, PlanCreate, PlanUpdate, PlanWithStats
from auth import get_current_user

router = APIRouter(prefix="/projects", tags=["plans"])

@router.get("/{project_id}/plans", response_model=List[PlanWithStats])
def get_project_plans(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all plans for a specific project"""
    # Check if user owns the project
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    plans = db.query(PlanModel).filter(
        PlanModel.project_id == project_id
    ).order_by(PlanModel.plan_letter).all()
    
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

@router.post("/{project_id}/plans", response_model=Plan)
def create_plan(
    project_id: int,
    plan: PlanCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new plan within a project"""
    # Check if user owns the project
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Check if plan letter already exists in this project
    existing_plan = db.query(PlanModel).filter(
        PlanModel.project_id == project_id,
        PlanModel.plan_letter == plan.plan_letter
    ).first()
    
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plan with this letter already exists in this project"
        )
    
    # Validate plan letter
    if plan.plan_letter not in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan letter"
        )
    
    # Create plan data without project_id from schema (it's in the URL)
    plan_data = plan.dict()
    plan_data['project_id'] = project_id
    
    db_plan = PlanModel(**plan_data)
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/{project_id}/plans/{plan_id}", response_model=Plan)
def get_plan(
    project_id: int,
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific plan"""
    # Check if user owns the project
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.project_id == project_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    return plan

@router.put("/{project_id}/plans/{plan_id}", response_model=Plan)
def update_plan(
    project_id: int,
    plan_id: int,
    plan_update: PlanUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a plan"""
    # Check if user owns the project
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.project_id == project_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    # Prevent deletion of Plan A
    if plan.plan_letter == "A":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plan A cannot be deleted as it serves as your starting point"
        )
    
    # Update only provided fields
    update_data = plan_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(plan, key, value)
    
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{project_id}/plans/{plan_id}")
def delete_plan(
    project_id: int,
    plan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a plan"""
    # Check if user owns the project
    project = db.query(ProjectModel).filter(
        ProjectModel.id == project_id,
        ProjectModel.owner_id == current_user.id
    ).first()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    plan = db.query(PlanModel).filter(
        PlanModel.id == plan_id,
        PlanModel.project_id == project_id
    ).first()
    
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found"
        )
    
    # Prevent deletion of Plan A
    if plan.plan_letter == "A":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Plan A cannot be deleted as it serves as your starting point"
        )
    
    db.delete(plan)
    db.commit()
    
    return {"message": f"Plan {plan.plan_letter} deleted successfully"}