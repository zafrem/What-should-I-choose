#!/usr/bin/env python3

from database import get_db, engine
from models import Base, Project, Plan, User
from sqlalchemy import text

def create_new_tables():
    """Create the new projects table and update schema"""
    print("🔄 Creating new database schema...")
    
    # Drop existing tables to start fresh (since we already deleted all data)
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS shared_links CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS comments CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS tasks CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS plans CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS projects CASCADE;"))
        conn.commit()
    
    # Create all tables with new schema
    Base.metadata.create_all(bind=engine)
    print("✅ New database schema created!")

def create_sample_project():
    """Create a sample project for testing"""
    db = next(get_db())
    
    try:
        # Get the admin user
        admin_user = db.query(User).filter(User.username == "admin").first()
        if not admin_user:
            print("❌ Admin user not found")
            return
        
        # Create Project1
        project = Project(
            title="Project1",
            description="First project for testing A-Z plans",
            owner_id=admin_user.id
        )
        db.add(project)
        db.commit()
        
        print(f"✅ Created Project1 (ID: {project.id})")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating sample project: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Migrating to Project-Plan hierarchy...")
    
    # Step 1: Create new database schema
    create_new_tables()
    
    # Step 2: Create a sample project for testing
    create_sample_project()
    
    print("\n🎉 Migration completed!")
    print("New structure:")
    print("  - Projects (Project1, Project2, etc.)")
    print("  - Each project can contain Plans A-Z")
    print("  - Plans are created manually as needed")