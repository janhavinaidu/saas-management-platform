from rest_framework import serializers
from django.contrib.auth.models import User
from tenants.models import Profile
from .models import SaaSApplication, LicenseRequest

# --- THIS IS THE FINAL, CORRECTED REGISTRATION SERIALIZER ---
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def validate(self, attrs):
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"detail": "A user with that username already exists."})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"detail": "A user with that email address already exists."})
        return attrs

    def create(self, validated_data):
        # Pop 'role' out before creating the User, as the User model doesn't have a 'role' field.
        role_data = validated_data.pop('role')
        
        # Create the user using the remaining validated data.
        # THIS ACTION TRIGGERS THE AUTOMATIC SIGNAL THAT CREATES THE PROFILE.
        user = User.objects.create_user(**validated_data)
        
        # --- THIS IS THE FIX ---
        # Instead of creating a new profile, we find the one that was just created by the signal.
        # Then, we simply UPDATE its 'role' field with the data from the form.
        # Refresh the user from database to ensure profile exists
        user.refresh_from_db()
        user.profile.role = role_data
        user.profile.save()
            
        return user


# --- ALL OTHER SERIALIZERS REMAIN THE SAME ---
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    class Meta:
        model = Profile
        fields = ['username', 'email', 'role']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

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

