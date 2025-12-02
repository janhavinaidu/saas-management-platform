from rest_framework import serializers
from django.contrib.auth.models import User
from tenants.models import Profile
from .models import SaaSApplication, LicenseRequest, IssueReport
from datetime import date

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    # If you want to allow setting role/department, remove read_only=True
    role = serializers.CharField(source='profile.role', required=False)
    department = serializers.CharField(source='profile.department', required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'department')

    def validate(self, attrs):
        # Check for duplicate username
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"detail": "A user with that username already exists."})
        
        # Check for duplicate email - this prevents one user from having multiple departments
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"detail": "A user with that email address already exists. Each user can only belong to one department."})
        
        # Check if trying to create a DEPT_HEAD for a department that already has one
        profile_data = attrs.get('profile', {})
        role = profile_data.get('role')
        department = profile_data.get('department')
        
        if role == 'DEPT_HEAD' and department:
            # Check if this department already has a head (case-insensitive)
            existing_head = Profile.objects.filter(
                role='DEPT_HEAD',
                department__iexact=department
            ).first()
            
            if existing_head:
                raise serializers.ValidationError({
                    "detail": f"The department '{department}' already has a department head: {existing_head.user.username}. Each department can only have one head."
                })
        
        return attrs

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        user.refresh_from_db()
        # Set role and department if provided
        if profile_data:
            if 'role' in profile_data:
                user.profile.role = profile_data['role']
            if 'department' in profile_data:
                user.profile.department = profile_data['department']
            user.profile.save()
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    class Meta:
        model = Profile
        fields = ['username', 'email', 'role', 'department']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    department = serializers.CharField(source='profile.department', read_only=True)
    licenses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'department', 'licenses_count', 'is_active']
    
    def get_licenses_count(self, obj):
        """Get count of approved licenses for this user"""
        return LicenseRequest.objects.filter(
            user=obj,
            request_type='GRANT',
            status='APPROVED'
        ).values('software_id').distinct().count()

class LicenseSerializer(serializers.Serializer):
    """Simple serializer for license information"""
    id = serializers.IntegerField()
    name = serializers.CharField()

class UserWithLicensesSerializer(serializers.ModelSerializer):
    """Serializer for users that includes their assigned licenses"""
    role = serializers.CharField(source='profile.role', read_only=True)
    department = serializers.CharField(source='profile.department', read_only=True)
    licenses = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'department', 'licenses']
    
    def get_licenses(self, obj):
        """Get all approved license requests for this user"""
        # Get unique software IDs for approved GRANT requests
        approved_software_ids = LicenseRequest.objects.filter(
            user=obj,
            request_type='GRANT',
            status='APPROVED'
        ).values_list('software_id', flat=True).distinct()
        
        # Get the software objects
        from .models import SaaSApplication
        software_list = SaaSApplication.objects.filter(id__in=approved_software_ids)
        
        return [
            {'id': software.id, 'name': software.name}
            for software in software_list
        ]

class SaaSApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaaSApplication
        fields = '__all__'

class LicenseRequestSerializer(serializers.ModelSerializer):
    software_name = serializers.CharField(write_only=True, required=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model = LicenseRequest
        fields = ['id', 'request_type', 'status', 'user', 'software', 'software_name', 'reason', 'requested_by', 'created_at', 'approval_level']
        read_only_fields = ['status', 'created_at', 'software', 'requested_by', 'approval_level']
    
    def create(self, validated_data):
        software_name = validated_data.pop('software_name')
        
        # Use filter().first() to handle duplicates gracefully
        software_instance = SaaSApplication.objects.filter(name__iexact=software_name).first()
        
        if not software_instance:
            raise serializers.ValidationError({"detail": f"Software '{software_name}' not found in the inventory."})
        
        license_request = LicenseRequest.objects.create(software=software_instance, **validated_data)
        return license_request

class UserLicenseRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for users to request licenses for themselves.
    Only requires software_name and reason.
    """
    software_name = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = LicenseRequest
        fields = ['id', 'request_type', 'status', 'user', 'software', 'software_name', 'reason', 'requested_by', 'created_at', 'approval_level']
        read_only_fields = ['status', 'created_at', 'software', 'requested_by', 'user', 'request_type', 'approval_level']
    
    def create(self, validated_data):
        software_name = validated_data.pop('software_name')
        
        # Set request_type to GRANT by default for user requests
        validated_data['request_type'] = 'GRANT'
        
        # Use filter().first() to handle duplicates gracefully
        software_instance = SaaSApplication.objects.filter(name__iexact=software_name).first()
        
        if not software_instance:
            # Auto-create software if it doesn't exist
            software_instance = SaaSApplication.objects.create(
                name=software_name,
                vendor='Unknown',
                category='Other',
                total_licenses=1,
                monthly_cost=0.00,
                renewal_date=date(2025, 12, 31)
            )
        
        license_request = LicenseRequest.objects.create(software=software_instance, **validated_data)
        return license_request

class IssueReportSerializer(serializers.ModelSerializer):
    """
    Serializer for users to report issues with their software.
    """
    class Meta:
        model = IssueReport
        fields = ['id', 'software_name', 'issue_type', 'status', 'description', 'reported_by', 'created_at', 'updated_at']
        read_only_fields = ['status', 'reported_by', 'created_at', 'updated_at']