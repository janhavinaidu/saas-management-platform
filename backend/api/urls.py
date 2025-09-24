from django.urls import path
from .views import UserListView

# This file defines the URL patterns for the 'api' app.
urlpatterns = [
    # When a request comes to 'users/', it will be handled by UserListView.
    path('users/', UserListView.as_view(), name='user-list'),
]
