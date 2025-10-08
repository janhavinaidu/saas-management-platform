from django.urls import path
from .views import (
    UserListView, 
    SaaSApplicationCreateView, 
    LicenseRequestCreateView,
    UserLicenseRequestCreateView,
    IssueReportCreateView,
    UserProfileView,
    RegisterView,
    SaaSApplicationListView,
    SaaSApplicationDetailView,
    InventoryStatsView,
    DashboardStatsView,
    DepartmentTeamView
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
    # --- THIS IS THE NEW ENDPOINT FOR DEPT HEADS ---
    # GET /api/department-team/ -> For a logged-in Dept Head to get ONLY their team members.
    path('department-team/', DepartmentTeamView.as_view(), name='department-team-list'),
    # --- SOFTWARE INVENTORY ENDPOINTS ---
    path('saas-applications/', SaaSApplicationListView.as_view(), name='saas-application-list'),
    path('saas-applications/create/', SaaSApplicationCreateView.as_view(), name='saas-application-create'),
    path('saas-applications/<int:pk>/', SaaSApplicationDetailView.as_view(), name='saas-application-detail'),

    # --- DASHBOARD STATS ENDPOINTS ---

    # GET /api/inventory-stats/ -> Retrieves stats for the Inventory page cards.
    path('inventory-stats/', InventoryStatsView.as_view(), name='inventory-stats'),

    # --- THIS IS THE NEWLY ADDED ENDPOINT ---
    # GET /api/dashboard-stats/ -> Retrieves stats for the main Admin Dashboard cards.
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # --- LICENSE REQUEST ENDPOINTS ---
    path('license-requests/', LicenseRequestCreateView.as_view(), name='license-request-create'),
    path('user-license-request/', UserLicenseRequestCreateView.as_view(), name='user-license-request-create'),
    
    # --- ISSUE REPORT ENDPOINTS ---
    path('report-issue/', IssueReportCreateView.as_view(), name='issue-report-create'),
]

