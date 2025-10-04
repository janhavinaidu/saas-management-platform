from django.urls import path
from .views import (
    UserListView, 
    SaaSApplicationCreateView, 
    LicenseRequestCreateView, 
    UserProfileView,
    RegisterView,
    SaaSApplicationListView,
    SaaSApplicationDetailView,
    InventoryStatsView  
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# This list defines all the URLs that are available under the `/api/` path.
urlpatterns = [
    # --- AUTHENTICATION & REGISTRATION ENDPOINTS ---
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),

    # --- DATA MANAGEMENT ENDPOINTS ---
    path('users/', UserListView.as_view(), name='user-list'),

    # --- SOFTWARE INVENTORY ENDPOINTS ---
    
    # GET: /api/saas-applications/ -> Retrieves a list of all software.
    path('saas-applications/', SaaSApplicationListView.as_view(), name='saas-application-list'),

    # POST: /api/saas-applications/create/ -> Adds a new software to the inventory.
    path('saas-applications/create/', SaaSApplicationCreateView.as_view(), name='saas-application-create'),

    # --- THIS IS THE NEW ENDPOINT ---
    # It handles actions on a *specific* software item by its ID (pk means "primary key").
    # GET: /api/saas-applications/5/ -> Retrieves software with ID 5.
    # PUT/PATCH: /api/saas-applications/5/ -> Updates software with ID 5.
    # DELETE: /api/saas-applications/5/ -> Deletes software with ID 5.
    path('saas-applications/<int:pk>/', SaaSApplicationDetailView.as_view(), name='saas-application-detail'),

    # --- LICENSE REQUEST ENDPOINTS ---
    path('license-requests/', LicenseRequestCreateView.as_view(), name='license-request-create'),
    
    # --- INVENTORY STATS ENDPOINT ---
    path('inventory-stats/', InventoryStatsView.as_view(), name='inventory-stats'),
]

