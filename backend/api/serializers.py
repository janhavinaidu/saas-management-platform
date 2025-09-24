from django.contrib.auth.models import User
from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    Converts User model instances to JSON.
    """
    class Meta:
        model = User
        # We specify which fields to include in the output.
        # It's important NOT to include sensitive data like password hashes.
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
