from django.db.models.signals import post_save
from django.contrib.auth.models import User
from django.dispatch import receiver
from .models import Profile

# This is a signal handler. It "listens" for when a User object is saved.
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a Profile for a new User.
    """
    if created:
        Profile.objects.create(user=instance)
