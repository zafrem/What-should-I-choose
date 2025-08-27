#!/usr/bin/env python3
"""
Script to create admin user with specified credentials.
Usage: python create_admin.py
"""

from database import SessionLocal, engine
from models import Base, User as UserModel
from auth import get_password_hash

def create_admin_user():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_email = "admin@atozplan.com"
        admin_username = "admin"
        
        existing_user = db.query(UserModel).filter(
            (UserModel.username == admin_username) | (UserModel.email == admin_email)
        ).first()
        
        if existing_user:
            print("Admin user already exists:")
            print(f"  Username: {existing_user.username}")
            print(f"  Email: {existing_user.email}")
            
            # Update password if different username/email
            if existing_user.username != admin_username or existing_user.email != admin_email:
                existing_user.username = admin_username
                existing_user.email = admin_email
                existing_user.hashed_password = get_password_hash("admin123")
                db.commit()
                print("Updated existing admin user credentials")
            else:
                # Just update password
                existing_user.hashed_password = get_password_hash("admin123")
                db.commit()
                print("Updated admin user password")
        else:
            # Create new admin user
            hashed_password = get_password_hash("admin123")
            admin_user = UserModel(
                username=admin_username,
                email=admin_email,
                hashed_password=hashed_password,
                is_active=True
            )
            
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            print("Admin user created successfully:")
            print(f"  Username: {admin_username}")
            print(f"  Email: {admin_email}")
            print("  Password: admin123")
            
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()