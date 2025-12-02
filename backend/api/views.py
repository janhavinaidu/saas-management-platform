from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from django.db.models import Sum, Value, DecimalField
from django.db.models.functions import Coalesce
from decimal import Decimal

from .serializers import (
    UserSerializer, 
    SaaSApplicationSerializer, 
    LicenseRequestSerializer, 
    UserProfileSerializer,
    RegisterSerializer,
    UserWithLicensesSerializer,
    UserLicenseRequestSerializer,
    IssueReportSerializer
)
from .models import SaaSApplication, LicenseRequest, IssueReport
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

class UpdateDepartmentView(APIView):
    """
    Endpoint for users (especially dept heads) to update their department.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        department = request.data.get('department', '').strip()
        
        if not department:
            return Response(
                {'detail': 'Department name is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            profile = request.user.profile
            profile.department = department
            profile.save()
            
            return Response(
                {'detail': 'Department updated successfully.', 'department': department},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'detail': f'Failed to update department: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# --- DATA MANAGEMENT VIEWS ---
class UserListView(generics.ListAPIView):
    """
    Endpoint to list all users with their roles and departments.
    Accessible by authenticated users (typically admins).
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.all().select_related('profile')
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
    """
    Endpoint for dept heads to create license requests for their team members.
    These requests go directly to admin for approval.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = LicenseRequest.objects.all()
    serializer_class = LicenseRequestSerializer
    
    def perform_create(self, serializer):
        # Dept heads request directly to admin
        serializer.save(
            requested_by=self.request.user,
            approval_level='ADMIN'
        )

class UserLicenseRequestCreateView(generics.CreateAPIView):
    """
    An endpoint for a regular user to submit a license request for themselves.
    These requests go to their department head for approval first.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = LicenseRequest.objects.all()
    serializer_class = UserLicenseRequestSerializer

    def perform_create(self, serializer):
        """
        This method automatically sets both 'user' (who the request is for)
        and 'requested_by' to the current logged-in user.
        Regular users' requests go to their dept head first.
        """
        user_profile = self.request.user.profile
        
        # If user is a dept head or admin, request goes to admin
        # Otherwise, request goes to dept head
        if user_profile.role in ['DEPT_HEAD', 'ADMIN']:
            approval_level = 'ADMIN'
        else:
            approval_level = 'DEPT_HEAD'
        
        serializer.save(
            user=self.request.user,
            requested_by=self.request.user,
            approval_level=approval_level
        )

class IssueReportCreateView(generics.CreateAPIView):
    """
    An endpoint for users to report issues with their software.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = IssueReport.objects.all()
    serializer_class = IssueReportSerializer

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)

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
            
            # Build software list for charts
            software_list = []
            for app in all_software:
                software_list.append({
                    'name': app.name,
                    'vendor': app.vendor,
                    'category': app.category,
                    'total_licenses': app.total_licenses,
                    'monthly_cost': str(app.monthly_cost),
                    'renewal_date': str(app.renewal_date)
                })
            
            data = {
                'total_software': total_software,
                'active_licenses': active_licenses,
                'expiring_soon': expiring_soon,
                'expired': expired,
                'software_list': software_list,  # Added for charts
            }
            return Response(data)
        
        except Exception as e:
            print(f"!!! ERROR in InventoryStatsView: {e}")
            return Response({'error': 'Failed to calculate inventory stats.'}, status=500)



from .tasks import run_license_optimization_task # <-- Import the task

# --- NEW VIEW TO ADD ---
class TriggerOptimizationAgentView(APIView):
    """
    An endpoint that triggers the Celery task to run the AI agent.
    """
    permission_classes = [permissions.IsAuthenticated] # Should be Admin-only

    def post(self, request, *args, **kwargs):
        try:
            # .delay() is how you tell Celery to run this task in the background.
            task = run_license_optimization_task.delay()
            print(f"✅ Celery task started with ID: {task.id}")
            return Response(
                {"message": "AI license optimization task has been started. Results will be available shortly.", "task_id": str(task.id)},
                status=status.HTTP_202_ACCEPTED
            )
        except Exception as e:
            print(f"❌ Error starting Celery task: {e}")
            # If Celery is not running, fall back to running synchronously
            try:
                from .license_agent import run_optimization_agent
                from .models import AIRecommendation
                
                print("⚠️ Celery not available, running synchronously...")
                recommendations = run_optimization_agent()
                AIRecommendation.objects.create(recommendations_text=recommendations)
                
                return Response(
                    {"message": "AI optimization completed (synchronous mode). Celery worker may not be running.", "warning": "Consider starting Celery for better performance."},
                    status=status.HTTP_200_OK
                )
            except Exception as sync_error:
                print(f"❌ Synchronous execution also failed: {sync_error}")
                return Response(
                    {"error": f"Failed to run optimization: {str(sync_error)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )


class AIRecommendationsView(APIView):
    """
    Endpoint to fetch the latest AI recommendations
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        try:
            from .models import AIRecommendation
            
            # Get the latest recommendation
            latest = AIRecommendation.objects.first()
            
            if not latest:
                return Response(
                    {"recommendations": None, "created_at": None},
                    status=status.HTTP_200_OK
                )
            
            return Response(
                {
                    "recommendations": latest.recommendations_text,
                    "created_at": latest.created_at.isoformat()
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            # If table doesn't exist yet, return empty response
            return Response(
                {
                    "recommendations": None, 
                    "created_at": None,
                    "error": "Database table not created yet. Please run migrations: python manage.py makemigrations && python manage.py migrate"
                },
                status=status.HTTP_200_OK
            )


class LicenseChatbotView(APIView):
    """
    Interactive chatbot endpoint for asking questions about license data
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        from .license_agent import chat_with_license_data
        
        question = request.data.get('question', '')
        
        if not question:
            return Response(
                {"error": "Question is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            answer = chat_with_license_data(question)
            return Response(
                {
                    "question": question,
                    "answer": answer
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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

            # Get users by department
            users_by_dept = {}
            for user in User.objects.filter(is_active=True):
                dept = getattr(user, 'department', None)
                if hasattr(user, 'profile'):
                    dept = user.profile.department if hasattr(user.profile, 'department') else None
                
                dept_name = dept if dept else 'No Department'
                users_by_dept[dept_name] = users_by_dept.get(dept_name, 0) + 1
            
            # --- THIS IS THE FIX ---
            # We must include `total_monthly_cost` in the data we send back.
            data = {
                'total_licenses': total_licenses,
                'active_users': active_users,
                'cost_savings': round(cost_savings, 2),
                'total_monthly_cost': round(float(total_monthly_cost_decimal), 2),
                'users_by_department': users_by_dept
            }
            return Response(data)
        
        except Exception as e:
            print(f"!!! CRITICAL ERROR in DashboardStatsView: {e}")
            return Response({'error': 'An error occurred while calculating dashboard stats.'}, status=500)

# --- THIS IS THE CORRECTED VIEW ---
class DepartmentTeamView(generics.ListAPIView):
    """
    An endpoint for a Department Head to get a list of users
    only within their own department, including their assigned licenses.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserWithLicensesSerializer

    def get_queryset(self):
        try:
            # Safely get the profile of the user making the request
            user_profile = self.request.user.profile
            
            # If the user has a department set, filter the user list by that department
            if user_profile and user_profile.department:
                # Use case-insensitive filtering to match departments
                # We also exclude the department head themselves from the list
                return User.objects.filter(
                    profile__department__iexact=user_profile.department
                ).exclude(pk=self.request.user.pk)
        
        except Profile.DoesNotExist:
            # If the user somehow has no profile, return an empty list to prevent a crash
            return User.objects.none()
        
        # If the user has no department, or something else goes wrong, return an empty list
        return User.objects.none()

class UserUpdateView(APIView):
    """
    Endpoint for admins to update user profile information (department and role).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, user_id):
        try:
            # Get the user to update
            user = User.objects.get(id=user_id)
            profile = user.profile
            
            # Get the data from request
            department = request.data.get('department')
            role = request.data.get('role')
            email = request.data.get('email')
            is_active = request.data.get('is_active')
            
            # Update email if provided
            if email:
                user.email = email
            
            # Update is_active if provided
            if is_active is not None:
                user.is_active = bool(is_active)
            
            user.save()
            
            # Update department if provided
            if department is not None:
                profile.department = department.strip() if department.strip() else None
            
            # Update role if provided
            if role:
                # Validate role
                if role not in ['ADMIN', 'DEPT_HEAD', 'USER']:
                    return Response(
                        {'detail': 'Invalid role. Must be ADMIN, DEPT_HEAD, or USER.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                profile.role = role
            
            profile.save()
            
            return Response(
                {
                    'detail': 'User updated successfully.',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'department': profile.department,
                        'role': profile.role
                    }
                },
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'detail': f'Failed to update user: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PendingRequestsView(APIView):
    """
    Endpoint for admins to view all pending license requests that need their approval.
    Returns requests with full details including requester info and justification.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Only admins should see all pending requests
            if request.user.profile.role != 'ADMIN':
                return Response(
                    {'detail': 'Only admins can view all pending requests.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get all pending requests that need admin approval
            pending_requests = LicenseRequest.objects.filter(
                status='PENDING',
                approval_level='ADMIN'
            ).select_related('user', 'software', 'requested_by', 'original_requester').order_by('-created_at')
            
            requests_data = []
            for req in pending_requests:
                requests_data.append({
                    'id': req.id,
                    'request_type': req.request_type,
                    'status': req.status,
                    'user': {
                        'id': req.user.id,
                        'username': req.user.username,
                        'email': req.user.email,
                        'department': req.user.profile.department if hasattr(req.user, 'profile') else None
                    },
                    'software': {
                        'id': req.software.id,
                        'name': req.software.name,
                        'vendor': req.software.vendor,
                        'monthly_cost': float(req.software.monthly_cost)
                    },
                    'requested_by': {
                        'id': req.requested_by.id,
                        'username': req.requested_by.username,
                        'role': req.requested_by.profile.role if hasattr(req.requested_by, 'profile') else None
                    },
                    'original_requester': {
                        'id': req.original_requester.id,
                        'username': req.original_requester.username,
                    } if req.original_requester else None,
                    'reason': req.reason,
                    'created_at': req.created_at.isoformat(),
                })
            
            return Response({
                'count': len(requests_data),
                'requests': requests_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"!!! ERROR in PendingRequestsView: {e}")
            return Response(
                {'detail': f'Failed to fetch pending requests: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeptHeadPendingRequestsView(APIView):
    """
    Endpoint for department heads to view pending requests from their team members.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            user_profile = request.user.profile
            
            if user_profile.role != 'DEPT_HEAD':
                return Response(
                    {'detail': 'Only department heads can view team requests.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if not user_profile.department:
                return Response(
                    {'detail': 'Department head must have a department assigned.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get pending requests from team members in this department
            pending_requests = LicenseRequest.objects.filter(
                status='PENDING',
                approval_level='DEPT_HEAD',
                user__profile__department__iexact=user_profile.department
            ).select_related('user', 'software', 'requested_by').order_by('-created_at')
            
            requests_data = []
            for req in pending_requests:
                requests_data.append({
                    'id': req.id,
                    'request_type': req.request_type,
                    'user': {
                        'id': req.user.id,
                        'username': req.user.username,
                        'email': req.user.email,
                    },
                    'software': {
                        'id': req.software.id,
                        'name': req.software.name,
                        'monthly_cost': float(req.software.monthly_cost)
                    },
                    'reason': req.reason,
                    'created_at': req.created_at.isoformat(),
                })
            
            return Response({
                'count': len(requests_data),
                'requests': requests_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"!!! ERROR in DeptHeadPendingRequestsView: {e}")
            return Response(
                {'detail': f'Failed to fetch team requests: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ApproveRejectRequestView(APIView):
    """
    Endpoint for admins to approve or reject license requests.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, request_id):
        try:
            # Only admins can approve/reject
            if request.user.profile.role != 'ADMIN':
                return Response(
                    {'detail': 'Only admins can approve or reject requests.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            license_request = LicenseRequest.objects.get(id=request_id)
            
            action = request.data.get('action')  # 'approve' or 'reject'
            admin_response = request.data.get('response', '')
            
            if action not in ['approve', 'reject']:
                return Response(
                    {'detail': 'Action must be either "approve" or "reject".'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if action == 'approve':
                license_request.status = 'APPROVED'
            else:
                license_request.status = 'REJECTED'
            
            license_request.admin_response = admin_response
            license_request.reviewed_by = request.user
            license_request.save()
            
            return Response({
                'detail': f'Request {action}d successfully.',
                'request': {
                    'id': license_request.id,
                    'status': license_request.status,
                    'admin_response': license_request.admin_response
                }
            }, status=status.HTTP_200_OK)
            
        except LicenseRequest.DoesNotExist:
            return Response(
                {'detail': 'License request not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"!!! ERROR in ApproveRejectRequestView: {e}")
            return Response(
                {'detail': f'Failed to process request: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ForwardRequestToAdminView(APIView):
    """
    Endpoint for department heads to forward user requests to admin.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, request_id):
        try:
            user_profile = request.user.profile
            
            if user_profile.role != 'DEPT_HEAD':
                return Response(
                    {'detail': 'Only department heads can forward requests.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            license_request = LicenseRequest.objects.get(id=request_id)
            
            # Update the request to be forwarded to admin
            license_request.approval_level = 'ADMIN'
            license_request.original_requester = license_request.requested_by
            license_request.requested_by = request.user  # Dept head is now the requester
            
            # Optionally add dept head's comments
            dept_head_comments = request.data.get('comments', '')
            if dept_head_comments:
                license_request.reason += f"\n\n[Dept Head Comments]: {dept_head_comments}"
            
            license_request.save()
            
            return Response({
                'detail': 'Request forwarded to admin successfully.',
                'request_id': license_request.id
            }, status=status.HTTP_200_OK)
            
        except LicenseRequest.DoesNotExist:
            return Response(
                {'detail': 'License request not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"!!! ERROR in ForwardRequestToAdminView: {e}")
            return Response(
                {'detail': f'Failed to forward request: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DeptHeadTeamIssuesView(APIView):
    """
    Endpoint for department heads to view issues reported by their team members.
    Only shows issues from regular users (not other dept heads) that are OPEN or IN_PROGRESS.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            user_profile = request.user.profile
            
            if user_profile.role != 'DEPT_HEAD':
                return Response(
                    {'detail': 'Only department heads can view team issues.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            if not user_profile.department:
                return Response(
                    {'detail': 'Department head must have a department assigned.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get issues from team members (exclude other dept heads) that are not resolved/closed
            team_issues = IssueReport.objects.filter(
                reported_by__profile__department__iexact=user_profile.department,
                reported_by__profile__role='USER',  # Only regular users, not dept heads
                status__in=['OPEN', 'IN_PROGRESS']  # Exclude resolved/closed
            ).select_related('reported_by').order_by('-created_at')
            
            issues_data = []
            for issue in team_issues:
                issues_data.append({
                    'id': issue.id,
                    'software_name': issue.software_name,
                    'issue_type': issue.issue_type,
                    'status': issue.status,
                    'description': issue.description,
                    'reported_by': {
                        'id': issue.reported_by.id,
                        'username': issue.reported_by.username,
                        'email': issue.reported_by.email,
                    },
                    'created_at': issue.created_at.isoformat(),
                    'updated_at': issue.updated_at.isoformat(),
                })
            
            return Response({
                'count': len(issues_data),
                'issues': issues_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"!!! ERROR in DeptHeadTeamIssuesView: {e}")
            return Response(
                {'detail': f'Failed to fetch team issues: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AdminAllIssuesView(APIView):
    """
    Endpoint for admins to view all issues reported across the organization.
    Only shows issues that are OPEN or IN_PROGRESS (resolved/closed are stored in history).
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            if request.user.profile.role != 'ADMIN':
                return Response(
                    {'detail': 'Only admins can view all issues.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get all issues that are not resolved/closed
            all_issues = IssueReport.objects.filter(
                status__in=['OPEN', 'IN_PROGRESS']
            ).select_related('reported_by').order_by('-created_at')
            
            issues_data = []
            for issue in all_issues:
                issues_data.append({
                    'id': issue.id,
                    'software_name': issue.software_name,
                    'issue_type': issue.issue_type,
                    'status': issue.status,
                    'description': issue.description,
                    'reported_by': {
                        'id': issue.reported_by.id,
                        'username': issue.reported_by.username,
                        'email': issue.reported_by.email,
                        'department': issue.reported_by.profile.department if hasattr(issue.reported_by, 'profile') else None
                    },
                    'created_at': issue.created_at.isoformat(),
                    'updated_at': issue.updated_at.isoformat(),
                })
            
            return Response({
                'count': len(issues_data),
                'issues': issues_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"!!! ERROR in AdminAllIssuesView: {e}")
            return Response(
                {'detail': f'Failed to fetch issues: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateIssueStatusView(APIView):
    """
    Endpoint for admins/dept heads to update issue status.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, issue_id):
        try:
            user_profile = request.user.profile
            
            # Only admins and dept heads can update status
            if user_profile.role not in ['ADMIN', 'DEPT_HEAD']:
                return Response(
                    {'detail': 'Only admins and department heads can update issue status.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            issue = IssueReport.objects.get(id=issue_id)
            
            # Dept heads can only update issues from their department
            if user_profile.role == 'DEPT_HEAD':
                if not user_profile.department or \
                   issue.reported_by.profile.department.lower() != user_profile.department.lower():
                    return Response(
                        {'detail': 'You can only update issues from your department.'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            new_status = request.data.get('status')
            
            if new_status not in ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']:
                return Response(
                    {'detail': 'Invalid status. Must be OPEN, IN_PROGRESS, RESOLVED, or CLOSED.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            issue.status = new_status
            
            # Set resolved_at if status is RESOLVED or CLOSED
            if new_status in ['RESOLVED', 'CLOSED'] and not issue.resolved_at:
                from django.utils import timezone
                issue.resolved_at = timezone.now()
            
            issue.save()
            
            return Response({
                'detail': 'Issue status updated successfully.',
                'issue': {
                    'id': issue.id,
                    'status': issue.status,
                    'resolved_at': issue.resolved_at.isoformat() if issue.resolved_at else None
                }
            }, status=status.HTTP_200_OK)
            
        except IssueReport.DoesNotExist:
            return Response(
                {'detail': 'Issue not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"!!! ERROR in UpdateIssueStatusView: {e}")
            return Response(
                {'detail': f'Failed to update issue: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DepartmentStatsView(APIView):
    """
    Endpoint for department heads to get statistics specific to their department.
    Returns: team member count, department spend, and total licenses.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Get the department of the logged-in user
            try:
                user_profile = request.user.profile
            except Profile.DoesNotExist:
                return Response(
                    {'detail': 'User profile not found.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if not user_profile.department:
                return Response(
                    {'detail': 'User does not have a department assigned.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            department = user_profile.department
            
            # Get all users in this department (excluding the dept head themselves)
            team_members = User.objects.filter(
                profile__department__iexact=department
            ).exclude(pk=request.user.pk)
            
            team_count = team_members.count()
            
            # Calculate total licenses assigned to team members
            # Count approved GRANT license requests for users in this department
            total_licenses = LicenseRequest.objects.filter(
                user__profile__department__iexact=department,
                request_type='GRANT',
                status='APPROVED'
            ).count()
            
            # Calculate department spend
            # Get all unique software assigned to team members in this department
            department_software_ids = LicenseRequest.objects.filter(
                user__profile__department__iexact=department,
                request_type='GRANT',
                status='APPROVED'
            ).values_list('software_id', flat=True).distinct()
            
            # Sum the monthly costs of these software applications
            department_spend = SaaSApplication.objects.filter(
                id__in=department_software_ids
            ).aggregate(
                total=Coalesce(Sum('monthly_cost'), Value(0), output_field=DecimalField())
            )['total']
            
            # Convert Decimal to float for JSON serialization
            department_spend = float(department_spend) if department_spend else 0.0
            
            data = {
                'team_members': team_count,
                'department_spend': round(department_spend, 2),
                'total_licenses': total_licenses,
                'department_name': department
            }
            
            return Response(data, status=status.HTTP_200_OK)
            
        except Profile.DoesNotExist:
            return Response(
                {'detail': 'User profile not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            print(f"!!! ERROR in DepartmentStatsView: {e}")
            return Response(
                {'detail': f'Failed to calculate department stats: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserAllocatedLicensesView(APIView):
    """
    Endpoint for users to view their allocated licenses with full details.
    Returns all approved licenses assigned to the logged-in user.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        try:
            # Get all approved GRANT license requests for the current user
            approved_software_ids = LicenseRequest.objects.filter(
                user=request.user,
                request_type='GRANT',
                status='APPROVED'
            ).values_list('software_id', flat=True).distinct()
            
            # Get the software objects with full details
            allocated_licenses = SaaSApplication.objects.filter(id__in=approved_software_ids)
            
            licenses_data = []
            for software in allocated_licenses:
                licenses_data.append({
                    'id': software.id,
                    'name': software.name,
                    'category': software.category,
                    'vendor': software.vendor,
                    'renewal_date': software.renewal_date.isoformat(),
                    'description': software.description,
                    'monthly_cost': float(software.monthly_cost)
                })
            
            return Response({
                'count': len(licenses_data),
                'licenses': licenses_data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"!!! ERROR in UserAllocatedLicensesView: {e}")
            return Response(
                {'detail': f'Failed to fetch allocated licenses: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )