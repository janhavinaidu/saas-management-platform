from django.urls import path
from .views import (
    UserListView, 
    SaaSApplicationCreateView, 
    LicenseRequestCreateView,
    UserLicenseRequestCreateView,
    IssueReportCreateView,
    UserProfileView,
    UpdateDepartmentView,
    RegisterView,
    SaaSApplicationListView,
    SaaSApplicationDetailView,
    InventoryStatsView,
    DashboardStatsView,
    DepartmentTeamView,
    UserUpdateView,
    DepartmentStatsView,
    PendingRequestsView,
    DeptHeadPendingRequestsView,
    ApproveRejectRequestView,
    ForwardRequestToAdminView,
    DeptHeadTeamIssuesView,
    AdminAllIssuesView,
    UpdateIssueStatusView,
    UserAllocatedLicensesView
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
    path('update-department/', UpdateDepartmentView.as_view(), name='update-department'),

    # --- DATA MANAGEMENT ENDPOINTS ---
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/', UserUpdateView.as_view(), name='user-update'),
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
    
    # GET /api/department-stats/ -> Retrieves stats for Department Head Dashboard
    path('department-stats/', DepartmentStatsView.as_view(), name='department-stats'),

    # --- LICENSE REQUEST ENDPOINTS ---
    path('license-requests/', LicenseRequestCreateView.as_view(), name='license-request-create'),
    path('user-license-request/', UserLicenseRequestCreateView.as_view(), name='user-license-request-create'),
    
    # GET /api/pending-requests/ -> Admin views all pending requests
    path('pending-requests/', PendingRequestsView.as_view(), name='pending-requests'),
    
    # GET /api/dept-head-requests/ -> Dept head views team member requests
    path('dept-head-requests/', DeptHeadPendingRequestsView.as_view(), name='dept-head-requests'),
    
    # POST /api/requests/<id>/approve-reject/ -> Admin approves/rejects a request
    path('requests/<int:request_id>/approve-reject/', ApproveRejectRequestView.as_view(), name='approve-reject-request'),
    
    # POST /api/requests/<id>/forward/ -> Dept head forwards request to admin
    path('requests/<int:request_id>/forward/', ForwardRequestToAdminView.as_view(), name='forward-request'),
    
    # --- ISSUE REPORT ENDPOINTS ---
    path('report-issue/', IssueReportCreateView.as_view(), name='issue-report-create'),
    
    # GET /api/dept-head-issues/ -> Dept head views team issues
    path('dept-head-issues/', DeptHeadTeamIssuesView.as_view(), name='dept-head-issues'),
    
    # GET /api/admin-issues/ -> Admin views all issues
    path('admin-issues/', AdminAllIssuesView.as_view(), name='admin-issues'),
    
    # PATCH /api/issues/<id>/status/ -> Update issue status
    path('issues/<int:issue_id>/status/', UpdateIssueStatusView.as_view(), name='update-issue-status'),
    
    # --- USER LICENSE ENDPOINTS ---
    # GET /api/user-licenses/ -> Get current user's allocated licenses
    path('user-licenses/', UserAllocatedLicensesView.as_view(), name='user-allocated-licenses'),
]

