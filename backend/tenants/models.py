from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# This is the Profile class that was missing.
class Profile(models.Model):
    # These are the choices for the user's role.
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        DEPT_HEAD = 'DEPT_HEAD', 'Department Head'
        USER = 'USER', 'User'
    
    # This links the Profile to a single User.
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # This stores the user's role, with 'USER' as the default.
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)

    # This __str__ method is now correctly indented inside the Profile class.
    def __str__(self):
        return f'{self.user.username} - {self.get_role_display()}'

# Signal handlers are now in signals.py file

