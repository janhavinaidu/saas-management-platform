"""
Script to check a specific user's details.
Run this with: python check_user.py
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'saas_project.settings')
django.setup()

from django.contrib.auth.models import User

def check_user():
    username = 'user'
    
    try:
        user = User.objects.get(username=username)
        print(f"Username: {user.username}")
        print(f"Email: {user.email}")
        print(f"Role: {user.profile.role}")
        print(f"Department: {user.profile.department}")
        print(f"ID: {user.id}")
    except User.DoesNotExist:
        print(f"User '{username}' not found!")

if __name__ == '__main__':
    check_user()
