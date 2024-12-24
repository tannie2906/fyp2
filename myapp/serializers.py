from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UploadedFile
from .models import File
from .models import DeletedFile  
from .models import Profile

from rest_framework import serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User  # Assuming you're using Django's built-in User model
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file_name', 'file', 'size', 'user_id', 'created_at', 'is_deleted', 'deleted_at', 'file_path']

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),  # Add first_name
            last_name=validated_data.get('last_name', '') 
        )
        return user

class UploadedFileSerializer(serializers.ModelSerializer):
    size = serializers.SerializerMethodField()  # Add size field
    owner = UserSerializer()  # Include owner details using the UserSerializer

    class Meta:
        model = UploadedFile
        fields = ['id', 'file_name', 'file', 'upload_date', 'size', 'owner']

    def get_size(self, obj):
        return obj.file.size  # Get the file size in bytes

class DeletedFilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeletedFile
        fields = '__all__'

    def validate(self, data):
        if data['user_id'] != self.context['request'].user.id:
            raise serializers.ValidationError("You do not have permission to access this file.")
        return data

class ProfilePictureSerializer(serializers.Serializer):
    profile_picture = serializers.ImageField()

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')  # Add username field from the user model
    
    class Meta:
        model = Profile
        fields = ['username', 'first_name', 'last_name', 'email', 'profile_picture']  # Include 'username' here

    def to_representation(self, instance):
        """Customize the representation if necessary"""
        representation = super().to_representation(instance)
        # Include user fields separately in the profile data
        user = instance.user
        representation['first_name'] = user.first_name
        representation['last_name'] = user.last_name
        representation['email'] = user.email
        return representation