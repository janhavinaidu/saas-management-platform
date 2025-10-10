"""
Script to manage department heads - delete or demote them.
Run this with: python manage_dept_heads.py
"""
import os
import django
import sys

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from django.contrib.auth.models import User
from tenants.models import Profile

def manage_dept_heads():
    print("\n=== Manage Department Heads ===\n")
    
    # Get all DEPT_HEAD users
    dept_heads = User.objects.filter(profile__role='DEPT_HEAD').order_by('profile__department', 'username')
    
    if not dept_heads.exists():
        print("No department heads found!")
        return
    
    print(f"Current department heads ({dept_heads.count()}):\n")
    
    for i, user in enumerate(dept_heads, 1):
        dept = user.profile.department or '(no department)'
        print(f"{i}. {user.username} - {dept} (ID: {user.id}, Email: {user.email})")
    
    print("\nWhat would you like to do?")
    print("1. Demote a department head to regular USER")
    print("2. Delete a department head account")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ").strip()
    
    if choice == '3':
        print("Exiting...")
        return
    
    if choice not in ['1', '2']:
        print("Invalid choice!")
        return
    
    user_num = input(f"\nEnter the number of the user (1-{dept_heads.count()}): ").strip()
    
    try:
        user_index = int(user_num) - 1
        if user_index < 0 or user_index >= dept_heads.count():
            print("Invalid user number!")
            return
        
        selected_user = list(dept_heads)[user_index]
        
        print(f"\nSelected: {selected_user.username} ({selected_user.profile.department or 'no department'})")
        confirm = input(f"Are you sure? (yes/no): ").strip().lower()
        
        if confirm != 'yes':
            print("Cancelled.")
            return
        
        if choice == '1':
            # Demote to USER
            selected_user.profile.role = 'USER'
            selected_user.profile.save()
            print(f"\n✓ Successfully demoted '{selected_user.username}' to USER role")
        
        elif choice == '2':
            # Delete the user
            username = selected_user.username
            selected_user.delete()
            print(f"\n✓ Successfully deleted user '{username}'")
        
        print("\nUpdated department heads:")
        dept_heads = User.objects.filter(profile__role='DEPT_HEAD').order_by('profile__department', 'username')
        for user in dept_heads:
            dept = user.profile.department or '(no department)'
            print(f"  - {user.username}: {dept}")
    
    except ValueError:
        print("Invalid input!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    manage_dept_heads()
