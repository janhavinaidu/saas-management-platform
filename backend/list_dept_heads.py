"""
Script to list all department heads.
Run this with: python list_dept_heads.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from django.contrib.auth.models import User
from tenants.models import Profile

def list_dept_heads():
    print("=== All Department Heads ===")
    
    # Get all DEPT_HEAD users
    dept_heads = User.objects.filter(profile__role='DEPT_HEAD').order_by('profile__department', 'username')
    
    if not dept_heads.exists():
        print("No department heads found!")
        return
    
    print(f"Total: {dept_heads.count()}")
    print()
    
    for user in dept_heads:
        dept = user.profile.department or '(no department)'
        print(f"  Username: {user.username}")
        print(f"  Email: {user.email}")
        print(f"  Department: {dept}")
        print(f"  ID: {user.id}")
        print()

if __name__ == '__main__':
    list_dept_heads()
