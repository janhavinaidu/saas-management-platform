"""
Script to identify and fix duplicate department heads.
Run this with: python fix_duplicate_dept_heads.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from django.contrib.auth.models import User
from tenants.models import Profile
from collections import defaultdict

def fix_duplicate_dept_heads():
    print("\n=== Checking for Duplicate Department Heads ===\n")
    
    # Get all DEPT_HEAD users
    dept_heads = User.objects.filter(profile__role='DEPT_HEAD')
    
    if not dept_heads.exists():
        print("No department heads found!")
        return
    
    # Group department heads by department
    dept_map = defaultdict(list)
    for user in dept_heads:
        dept = user.profile.department
        if dept:
            dept_map[dept].append(user)
    
    # Find duplicates
    duplicates_found = False
    for dept, users in dept_map.items():
        if len(users) > 1:
            duplicates_found = True
            print(f"⚠️  Department '{dept}' has {len(users)} heads:")
            for i, user in enumerate(users, 1):
                print(f"   {i}. {user.username} (ID: {user.id}, Email: {user.email})")
            
            print(f"\n   Which user should remain as the department head for '{dept}'?")
            print(f"   Enter the number (1-{len(users)}), or 0 to skip this department:")
            
            try:
                choice = int(input("   Your choice: "))
                if choice == 0:
                    print(f"   Skipped '{dept}'\n")
                    continue
                elif 1 <= choice <= len(users):
                    keeper = users[choice - 1]
                    print(f"\n   Keeping '{keeper.username}' as head of '{dept}'")
                    
                    # Demote the others to regular users
                    for user in users:
                        if user.id != keeper.id:
                            user.profile.role = 'USER'
                            user.profile.save()
                            print(f"   ✓ Demoted '{user.username}' to USER role")
                    print()
                else:
                    print(f"   Invalid choice. Skipped '{dept}'\n")
            except ValueError:
                print(f"   Invalid input. Skipped '{dept}'\n")
    
    if not duplicates_found:
        print("✓ No duplicate department heads found!")
    else:
        print("\n=== Summary of Current Department Heads ===")
        dept_heads = User.objects.filter(profile__role='DEPT_HEAD')
        for user in dept_heads:
            print(f"  - {user.profile.department}: {user.username}")

if __name__ == '__main__':
    fix_duplicate_dept_heads()
