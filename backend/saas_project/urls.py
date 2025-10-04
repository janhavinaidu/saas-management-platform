"""
saas_project URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include

# This is the root URL configuration for the entire Django project.
urlpatterns = [
    # 1. The path for the Django admin interface.
    path('admin/', admin.site.urls),

    # 2. This is the most important line for your API.
    #    It tells Django that any URL that starts with 'api/' should be
    #    passed on to the 'api' app's own urls.py file for further routing.
    path('api/', include('api.urls')),
]

