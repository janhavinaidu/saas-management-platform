from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer

class UserListView(generics.ListAPIView):
    """
    API view to retrieve a list of users.
    This is a read-only endpoint.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer