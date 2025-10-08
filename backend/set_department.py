"""
Quick script to set a department for a user.
Run this with: python set_department.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from django.contrib.auth.models import User
from tenants.models import Profile

def set_user_department():
    print("\n=== Set User Department ===\n")
    
    # List all users
    users = User.objects.all()
    print("Available users:")
    for i, user in enumerate(users, 1):
        profile = user.profile
        print(f"{i}. {user.username} (Role: {profile.role}, Department: {profile.department or 'None'})")
    
    # Get user selection
    user_num = input("\nEnter the number of the user to update: ")
    try:
        user = users[int(user_num) - 1]
    except (ValueError, IndexError):
        print("Invalid selection!")
        return
    
    # Get department name
    department = input(f"\nEnter department for {user.username}: ")
    
    # Update the profile
    user.profile.department = department
    user.profile.save()
    
    print(f"\n✓ Successfully set department '{department}' for user '{user.username}'")
    print(f"  Role: {user.profile.role}")
    print(f"  Department: {user.profile.department}")

if __name__ == '__main__':
    set_user_department()
