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
    
    departments = {
        'hello': 'Engineering',
        'test': 'Marketing',
    }
    
    for user in dept_heads:
        dept_name = departments.get(user.username, 'General')
        user.profile.department = dept_name
        user.profile.save()
        print(f"✓ Set '{user.username}' department to: {dept_name}")
    
    print("\n=== All Department Heads Updated ===")
    print("\nCurrent Department Heads:")
    for user in dept_heads:
        user.refresh_from_db()
        print(f"  - {user.username}: {user.profile.department}")

if __name__ == '__main__':
    set_dept_head_departments()
