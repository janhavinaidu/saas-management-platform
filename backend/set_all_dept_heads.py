"""
Quick script to set departments for all DEPT_HEAD users.
Run this with: python set_all_dept_heads.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from django.contrib.auth.models import User
from tenants.models import Profile

def set_dept_head_departments():
    print("\n=== Setting Departments for Department Heads ===\n")
    
    # Get all DEPT_HEAD users
    dept_heads = User.objects.filter(profile__role='DEPT_HEAD')
    
    if not dept_heads.exists():
        print("No department heads found!")
        return
    
    # WARNING: This mapping should ensure each department has only ONE head
    # If you need to add more dept heads, make sure they're for DIFFERENT departments
    departments = {
        'hello': 'Engineering',
        # 'test': 'Marketing',  # Commented out - only use if you want a Marketing dept head
    }
    
    # Track which departments are already assigned
    assigned_depts = set()
    
    for user in dept_heads:
        dept_name = departments.get(user.username)
        
        if not dept_name:
            print(f"⚠️  No department mapping for '{user.username}' - skipping")
            continue
            
        # Check if this department already has a head
        if dept_name in assigned_depts:
            print(f"⚠️  Department '{dept_name}' already has a head - skipping '{user.username}'")
            continue
        
        # Check if another user is already head of this department
        existing_head = Profile.objects.filter(
            role='DEPT_HEAD',
            department=dept_name
        ).exclude(user=user).first()
        
        if existing_head:
            print(f"⚠️  Department '{dept_name}' already has head '{existing_head.user.username}' - skipping '{user.username}'")
            continue
        
        user.profile.department = dept_name
        user.profile.save()
        assigned_depts.add(dept_name)
        print(f"✓ Set '{user.username}' as head of: {dept_name}")
    
    print("\n=== All Department Heads Updated ===")
    print("\nCurrent Department Heads:")
    dept_heads = User.objects.filter(profile__role='DEPT_HEAD')
    for user in dept_heads:
        user.refresh_from_db()
        print(f"  - {user.username}: {user.profile.department or '(no department set)'}")

if __name__ == '__main__':
    set_dept_head_departments()
