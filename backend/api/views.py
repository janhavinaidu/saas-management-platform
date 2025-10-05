from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Value
from django.db.models.functions import Coalesce
from decimal import Decimal

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
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserProfileSerializer
    def get_object(self):
        return self.request.user.profile

# --- DATA MANAGEMENT VIEWS ---
class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer

class SaaSApplicationListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = SaaSApplication.objects.all()
    serializer_class = SaaSApplicationSerializer

class SaaSApplicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = SaaSApplication.objects.all()
    serializer_class = SaaSApplicationSerializer

class SaaSApplicationCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = SaaSApplication.objects.all()
    serializer_class = SaaSApplicationSerializer

class LicenseRequestCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = LicenseRequest.objects.all()
    serializer_class = LicenseRequestSerializer
    def perform_create(self, serializer):
        serializer.save(requested_by=self.request.user)

# --- DASHBOARD STATISTICS VIEWS ---
class InventoryStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        try:
            from datetime import datetime, timedelta
            
            # Get all software applications
            all_software = SaaSApplication.objects.all()
            total_software = all_software.count()
            
            # Calculate active licenses (sum of all total_licenses)
            active_licenses = all_software.aggregate(
                total=Coalesce(Sum('total_licenses'), Value(0))
            )['total']
            
            # Calculate expiring soon (within 30 days) and expired
            today = datetime.now().date()
            thirty_days_from_now = today + timedelta(days=30)
            
            expiring_soon = 0
            expired = 0
            
            for software in all_software:
                if software.renewal_date:
                    if software.renewal_date < today:
                        expired += 1
                    elif software.renewal_date <= thirty_days_from_now:
                        expiring_soon += 1
            
            data = {
                'total_software': total_software,
                'active_licenses': active_licenses,
                'expiring_soon': expiring_soon,
                'expired': expired,
            }
            return Response(data)
        
        except Exception as e:
            print(f"!!! ERROR in InventoryStatsView: {e}")
            return Response({'error': 'Failed to calculate inventory stats.'}, status=500)

# --- THIS IS THE CORRECTED VIEW ---
class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            # User calculations
            total_users = User.objects.count()
            active_users = User.objects.filter(is_active=True).count() 

            # Inventory calculations
            inventory_queryset = SaaSApplication.objects.all()
            
            # Use database aggregation for a more efficient cost calculation.
            # The result will be a Decimal type or None.
            total_cost_result = inventory_queryset.aggregate(
                total_cost=Sum('monthly_cost')
            )['total_cost']

            # Ensure total_cost_result is not None before converting.
            total_monthly_cost_decimal = total_cost_result or Decimal('0.0')

            # --- THIS IS THE FIX ---
            # We must explicitly convert the Decimal type from the database to a float
            # before performing multiplication with another float.
            cost_savings = float(total_monthly_cost_decimal) * 0.15 

            # Use total software count as a proxy for total licenses for now
            total_licenses = inventory_queryset.count()

            data = {
                'total_licenses': total_licenses,
                'active_users': active_users,
                'cost_savings': round(cost_savings, 2),
            }
            
            # --- THIS IS THE FIX ---
            # We must include `total_monthly_cost` in the data we send back.
            data = {
                'total_licenses': total_licenses,
                'active_users': active_users,
                'cost_savings': round(cost_savings, 2),
                'total_monthly_cost': round(float(total_monthly_cost_decimal), 2), # <-- THE MISSING PIECE
            }
            return Response(data)
        
        except Exception as e:
            print(f"!!! CRITICAL ERROR in DashboardStatsView: {e}")
            return Response({'error': 'An error occurred while calculating dashboard stats.'}, status=500)

