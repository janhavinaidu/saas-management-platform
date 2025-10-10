"""
Script to standardize department names (fix case inconsistencies).
Run this with: python standardize_departments.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from django.contrib.auth.models import User
from tenants.models import Profile
from collections import defaultdict

def standardize_departments():
    print("\n=== Standardizing Department Names ===\n")
    
    # Get all users with departments
    users_with_dept = User.objects.exclude(profile__department__isnull=True).exclude(profile__department='')
    
    if not users_with_dept.exists():
        print("No users with departments found!")
        return
    
    # Group users by department (case-insensitive)
    dept_groups = defaultdict(list)
    for user in users_with_dept:
        dept_lower = user.profile.department.lower()
        dept_groups[dept_lower].append(user)
    
    print(f"Found {len(dept_groups)} unique departments (case-insensitive):\n")
    
    for dept_lower, users in dept_groups.items():
        # Get all the different case variations
        variations = set(user.profile.department for user in users)
        
        if len(variations) > 1:
            print(f"⚠️  Department '{dept_lower}' has {len(variations)} case variations:")
            for var in variations:
                count = sum(1 for u in users if u.profile.department == var)
                print(f"   - '{var}' ({count} users)")
            
            # Choose the most common variation, or the capitalized one
            # Prefer the one used by a DEPT_HEAD if exists
            dept_head_variation = None
            for user in users:
                if user.profile.role == 'DEPT_HEAD':
                    dept_head_variation = user.profile.department
                    break
            
            if dept_head_variation:
                standard_name = dept_head_variation
                print(f"   → Standardizing to: '{standard_name}' (used by dept head)")
            else:
                # Use title case as standard
                standard_name = dept_lower.title()
                print(f"   → Standardizing to: '{standard_name}' (title case)")
            
            # Update all users to use the standard name
            updated = 0
            for user in users:
                if user.profile.department != standard_name:
                    user.profile.department = standard_name
                    user.profile.save()
                    updated += 1
            
            print(f"   ✓ Updated {updated} users\n")
        else:
            print(f"✓ '{list(variations)[0]}' - consistent ({len(users)} users)")
    
    print("\n=== Standardization Complete ===")
    print("\nFinal department list:")
    
    # Show final state
    dept_summary = defaultdict(lambda: {'total': 0, 'heads': [], 'users': []})
    for user in User.objects.exclude(profile__department__isnull=True).exclude(profile__department=''):
        dept = user.profile.department
        dept_summary[dept]['total'] += 1
        if user.profile.role == 'DEPT_HEAD':
            dept_summary[dept]['heads'].append(user.username)
        else:
            dept_summary[dept]['users'].append(user.username)
    
    for dept, info in sorted(dept_summary.items()):
        print(f"\n  {dept}:")
        print(f"    Total users: {info['total']}")
        if info['heads']:
            print(f"    Dept heads: {', '.join(info['heads'])}")
        if info['users']:
            print(f"    Regular users: {', '.join(info['users'][:5])}" + 
                  (f" ... and {len(info['users']) - 5} more" if len(info['users']) > 5 else ""))

if __name__ == '__main__':
    standardize_departments()
