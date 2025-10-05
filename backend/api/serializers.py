from rest_framework import serializers
from django.contrib.auth.models import User
from tenants.models import Profile
from .models import SaaSApplication, LicenseRequest

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
        fields = ['username', 'email', 'role']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    department = serializers.CharField(source='profile.department', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'department']

class SaaSApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaaSApplication
        fields = '__all__'

class LicenseRequestSerializer(serializers.ModelSerializer):
    software_name = serializers.CharField(write_only=True)
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    class Meta:
        model = LicenseRequest
        fields = ['id', 'request_type', 'status', 'user', 'software', 'software_name', 'reason', 'requested_by', 'created_at']
        read_only_fields = ['status', 'requested_by', 'created_at', 'software']
    
    def create(self, validated_data):
        software_name = validated_data.pop('software_name')
        try:
            software_instance = SaaSApplication.objects.get(name__iexact=software_name)
        except SaaSApplication.DoesNotExist:
            raise serializers.ValidationError(f"Software '{software_name}' not found.")
        license_request = LicenseRequest.objects.create(software=software_instance, **validated_data)
        return license_request