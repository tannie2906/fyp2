from rest_framework import serializers
from django.contrib.auth.models import User
from .models import File
from .models import UploadedFile
from .models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'filename', 'file', 'upload_date']

from rest_framework import serializers
from django.contrib.auth.models import User

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']  # Add username here


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],  # Ensure email is saved
            password=validated_data['password']
        )
        return user

