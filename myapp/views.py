from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.http import JsonResponse, FileResponse
from django.conf import settings
from django.shortcuts import get_object_or_404

from .models import UploadedFile, File
from .serializers import UserSerializer, UploadedFileSerializer, UserRegistrationSerializer, FileSerializer

import json
import logging
import uuid
import os

# new 
from django.views.decorators.http import require_GET

logger = logging.getLogger(__name__)


# File Upload
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        name = request.data.get('name')
        if not file:
            return Response({"error": "No file provided."}, status=400)

        unique_filename = f"{uuid.uuid4().hex}_{name}"
        uploaded_file = UploadedFile.objects.create(file=file, filename=unique_filename, owner=request.user)
        return Response({
            "message": "File uploaded successfully!",
            "file_url": settings.MEDIA_URL + uploaded_file.file.name
        }, status=201)

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()  # Explicitly set the queryset
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter queryset based on the current authenticated user
        return self.queryset.filter(user=self.request.user, is_deleted=False)

# List user-uploaded files
class FileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        uploaded_files = UploadedFile.objects.filter(owner=request.user, is_deleted=False)
        serializer = UploadedFileSerializer(uploaded_files, many=True)
        return Response(serializer.data)


# View for handling deleted files
class DeletedFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deleted_files = UploadedFile.objects.filter(owner=request.user, is_deleted=True)
        serializer = UploadedFileSerializer(deleted_files, many=True)
        return Response(serializer.data)


# User Authentication
class CustomAuthToken(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user = authenticate(
            username=request.data.get('username'),
            password=request.data.get('password')
        )
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key})
        return Response({"error": "Invalid credentials"}, status=400)


# Profile View
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()
        return Response({"message": "Profile updated successfully"})


# User Registration
class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"message": "User registered successfully", "token": token.key}, status=201)
        return Response(serializer.errors, status=400)


# Rename a file
@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def rename_file(request, file_id):
    try:
        new_name = json.loads(request.body).get('newName')
        if not new_name:
            return JsonResponse({'error': 'New name is required.'}, status=400)

        file = UploadedFile.objects.get(id=file_id, owner=request.user)
        if UploadedFile.objects.filter(owner=request.user, filename=new_name).exists():
            return JsonResponse({'error': 'A file with this name already exists.'}, status=400)

        file.filename = new_name
        file.save()
        return JsonResponse({'message': 'File renamed successfully.'}, status=200)
    except UploadedFile.DoesNotExist:
        return JsonResponse({'error': 'File not found or not owned by the user.'}, status=404)


# Delete a file
@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id):
    try:
        file = UploadedFile.objects.get(id=file_id, owner=request.user)
        file.is_deleted = True
        file.save()
        return JsonResponse({"message": "File successfully deleted."})
    except UploadedFile.DoesNotExist:
        return JsonResponse({"error": "File not found or not owned by the user."}, status=404)


# File Download
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):
    try:
        file = UploadedFile.objects.get(id=file_id, owner=request.user, is_deleted=False)
        file_path = file.file.path
        if not os.path.exists(file_path):
            return JsonResponse({'error': 'File does not exist on disk.'}, status=500)
        response = FileResponse(open(file_path, 'rb'), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{file.filename}"'
        return response
    except UploadedFile.DoesNotExist:
        return JsonResponse({'error': 'File not found or deleted.'}, status=404)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def permanently_delete_file(request, file_id):
    """
    Permanently delete a file both from storage and the database.
    """
    try:
        # Fetch the file owned by the authenticated user
        file_obj = UploadedFile.objects.get(id=file_id, owner=request.user, is_deleted=True)
        
        # Delete file from storage if it exists
        file_path = file_obj.file.path
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete the file record from the database
        file_obj.delete()
        return JsonResponse({'message': 'File permanently deleted.'}, status=200)
    
    except UploadedFile.DoesNotExist:
        return JsonResponse({'error': 'File not found or unauthorized access.'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=400)

# ViewSet for files
class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return File.objects.filter(user=self.request.user, is_deleted=False)

# update new
@require_GET
def get_settings(request):
    # Replace with actual user settings logic
    settings_data = {
        'username': 'example_user',
        'email': 'example@example.com',
        'language': 'en',
    }
    return JsonResponse(settings_data)

@csrf_exempt
def update_username(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        new_username = data.get('username')
        # Replace with actual logic to update username
        return JsonResponse({'message': f'Username updated to {new_username}'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def empty_bin(request):
    try:
        # Fetch and permanently delete all files marked as deleted
        deleted_files = UploadedFile.objects.filter(owner=request.user, is_deleted=True)
        for file in deleted_files:
            # Remove the file from storage
            file_path = file.file.path
            if os.path.exists(file_path):
                os.remove(file_path)
            # Delete the file from the database
            file.delete()
        
        return JsonResponse({"message": "Bin emptied successfully."}, status=200)
    
    except Exception as e:
        return JsonResponse({"error": f"An error occurred: {str(e)}"}, status=500)
    
@api_view(['GET'])
def profile_view(request):
    user = request.user
    profile_data = {
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        # Add more profile data if needed
    }
    return Response(profile_data)