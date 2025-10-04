from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .serializers import (
    UserSerializer, 
    SaaSApplicationSerializer, 
    LicenseRequestSerializer, 
    UserProfileSerializer,
    RegisterSerializer
)
from .models import SaaSApplication, LicenseRequest
from tenants.models import Profile

# --- AUTHENTICATION & USER VIEWS ---
class SaaSApplicationListView(generics.ListAPIView):
    """
    An endpoint for admins to get a list of all software applications in the inventory.
    """
    permission_classes = [permissions.IsAuthenticated] # Ensures only logged-in users can access it
    queryset = SaaSApplication.objects.all()
    serializer_class = SaaSApplicationSerializer

class RegisterView(generics.CreateAPIView):
    """
    An endpoint for creating new user accounts.
    This is publicly accessible so anyone can sign up.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    

class UserProfileView(generics.RetrieveAPIView):
    """
    An endpoint that provides the profile (including the role) of the
    currently authenticated user. This is crucial for the frontend to
    determine which dashboard to display.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        # The `request.user` attribute is automatically populated by the
        # authentication middleware with the logged-in user.
        profile = self.request.user.profile
        print(f"DEBUG: User {self.request.user.username} has role: {profile.role}")
        return profile

# --- DATA MANAGEMENT VIEWS ---

class UserListView(generics.ListAPIView):
    """
    An endpoint for admins to get a list of all users in the system.
    """
    permission_classes = [permissions.IsAuthenticated] # Should be admin-only in the future
    queryset = User.objects.all()
    serializer_class = UserSerializer

class InventoryStatsView(APIView):
    """
    An endpoint that calculates and returns key statistics for the inventory dashboard.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Get the full queryset of applications
        queryset = SaaSApplication.objects.all()

        # Calculate the date 30 days from now for 'expiring soon' logic
        today = timezone.now().date()
        thirty_days_from_now = today + timedelta(days=30)

        # Perform the calculations
        total_software = queryset.count()
        expired_count = queryset.filter(renewal_date__lt=today).count()
        expiring_soon_count = queryset.filter(renewal_date__gte=today, renewal_date__lte=thirty_days_from_now).count()
        
        # Active is everything that isn't expired
        active_licenses = total_software - expired_count

        # Prepare the data to be sent
        data = {
            'total_software': total_software,
            'active_licenses': active_licenses,
            'expiring_soon': expiring_soon_count,
            'expired': expired_count,
        }
        return Response(data)    
class SaaSApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    An endpoint for a single software application.
    - GET: Retrieves the details of one application.
    - PUT/PATCH: Updates an application.
    - DELETE: Deletes an application.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = SaaSApplication.objects.all()
    serializer_class = SaaSApplicationSerializer    

class SaaSApplicationCreateView(generics.CreateAPIView):
    """
    An endpoint for admins to add a new software application to the inventory.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = SaaSApplication.objects.all()
    serializer_class = SaaSApplicationSerializer

class LicenseRequestCreateView(generics.CreateAPIView):
    """
    An endpoint for department heads to submit a new license grant or revoke request.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = LicenseRequest.objects.all()
    serializer_class = LicenseRequestSerializer

    def perform_create(self, serializer):
        """
        This method is called before saving a new LicenseRequest.
        It automatically sets the 'requested_by' field to the current logged-in user.
        """
        serializer.save(requested_by=self.request.user)

