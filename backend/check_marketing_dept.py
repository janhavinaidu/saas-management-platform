"""
Script to check all users in Marketing department.
Run this with: python check_marketing_dept.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from django.contrib.auth.models import User
from tenants.models import Profile

def check_marketing():
    print("\n=== All Users in Marketing Department ===\n")
    
    # Get all users in Marketing department
    marketing_users = User.objects.filter(profile__department='Marketing').order_by('profile__role', 'username')
    
    if not marketing_users.exists():
        print("No users found in Marketing department!")
        return
    
    print(f"Total users: {marketing_users.count()}\n")
    
    dept_heads = []
    regular_users = []
    
    for user in marketing_users:
        role = user.profile.role
        info = f"  Username: {user.username}, Email: {user.email}, Role: {role}, ID: {user.id}"
        
        if role == 'DEPT_HEAD':
            dept_heads.append(info)
        else:
            regular_users.append(info)
    
    if dept_heads:
        print(f"Department Heads ({len(dept_heads)}):")
        for info in dept_heads:
            print(info)
        print()
    
    if regular_users:
        print(f"Regular Users ({len(regular_users)}):")
        for info in regular_users:
            print(info)
        print()
    
    if len(dept_heads) > 1:
        print("⚠️  WARNING: Multiple department heads found for Marketing!")
        print("   This should not happen - each department should have only ONE head.")

if __name__ == '__main__':
    check_marketing()
