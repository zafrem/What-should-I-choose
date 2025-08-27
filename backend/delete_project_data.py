#!/usr/bin/env python3

from database import get_db
from models import Plan, Task, Comment

def delete_all_project_data():
    """Delete all project data (plans, tasks, comments) while keeping users"""
    
    # Get database session
    db = next(get_db())
    
    try:
        # Get current counts
        comment_count = db.query(Comment).count()
        task_count = db.query(Task).count()
        plan_count = db.query(Plan).count()
        
        print(f"Before deletion:")
        print(f"  Comments: {comment_count}")
        print(f"  Tasks: {task_count}")
        print(f"  Plans: {plan_count}")
        
        # Delete in the correct order (due to foreign key constraints)
        # 1. Delete comments first (they reference plans)
        deleted_comments = db.query(Comment).delete()
        print(f"\nDeleted {deleted_comments} comments")
        
        # 2. Delete tasks (they reference plans)
        deleted_tasks = db.query(Task).delete()
        print(f"Deleted {deleted_tasks} tasks")
        
        # 3. Delete plans last
        deleted_plans = db.query(Plan).delete()
        print(f"Deleted {deleted_plans} plans")
        
        # Commit the changes
        db.commit()
        
        print(f"\n✅ Successfully deleted all project data!")
        print(f"   Total deleted: {deleted_comments + deleted_tasks + deleted_plans} records")
        
        # Verify deletion
        remaining_comments = db.query(Comment).count()
        remaining_tasks = db.query(Task).count()
        remaining_plans = db.query(Plan).count()
        
        print(f"\nAfter deletion:")
        print(f"  Comments: {remaining_comments}")
        print(f"  Tasks: {remaining_tasks}")
        print(f"  Plans: {remaining_plans}")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting project data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🗑️  Deleting all project data...")
    print("Note: This will preserve user accounts but delete all plans, tasks, and comments.")
    
    # Ask for confirmation
    confirmation = input("\nAre you sure you want to delete all project data? (yes/no): ").lower().strip()
    
    if confirmation == 'yes':
        delete_all_project_data()
    else:
        print("Deletion cancelled.")