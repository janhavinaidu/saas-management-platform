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
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"detail": "A user with that username already exists."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"detail": "A user with that email address already exists."})
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
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'department']

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
        approved_requests = LicenseRequest.objects.filter(
            user=obj,
            request_type='GRANT',
            status='APPROVED'
        ).select_related('software')
        
        return [
            {'id': req.software.id, 'name': req.software.name}
            for req in approved_requests
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
        fields = ['id', 'request_type', 'status', 'user', 'software', 'software_name', 'reason', 'requested_by', 'created_at']
        read_only_fields = ['status', 'created_at', 'software', 'requested_by']
    
    def create(self, validated_data):
        software_name = validated_data.pop('software_name')
        try:
            software_instance = SaaSApplication.objects.get(name__iexact=software_name)
        except SaaSApplication.DoesNotExist:
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
        fields = ['id', 'request_type', 'status', 'user', 'software', 'software_name', 'reason', 'requested_by', 'created_at']
        read_only_fields = ['status', 'created_at', 'software', 'requested_by', 'user', 'request_type']
    
    def create(self, validated_data):
        software_name = validated_data.pop('software_name')
        
        # Set request_type to GRANT by default for user requests
        validated_data['request_type'] = 'GRANT'
        
        try:
            software_instance = SaaSApplication.objects.get(name__iexact=software_name)
        except SaaSApplication.DoesNotExist:
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