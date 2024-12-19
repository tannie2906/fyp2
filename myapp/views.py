from datetime import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.exceptions import ValidationError

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.views.decorators.http import require_GET
from django.contrib.auth import authenticate
from django.http import JsonResponse, FileResponse
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.utils.timezone import now 
from django.utils import timezone


from .models import DeletedFile, UploadedFile, File, SharedFile
from .serializers import DeletedFilesSerializer, UserSerializer, UploadedFileSerializer, UserRegistrationSerializer, FileSerializer
from myapp.models import File

import json
import logging
import uuid
import os


logger = logging.getLogger(__name__)

# Helper to validate file ownership
def validate_file_owner(file_id, user):
    try:
        file = File.objects.get(id=file_id)
        if file.user != user:
            raise ValidationError("You are not authorized to access this file.")
        return file
    except File.DoesNotExist:
        raise ValidationError("File not found.")

@api_view(['GET'])
def shared_file_detail(request, share_link):
    try:
        shared_file = SharedFile.objects.get(share_link=share_link)
        file = shared_file.file
        return Response({
            "filename": file.filename,
            "file_url": request.build_absolute_uri(file.file.url),
            "permissions": shared_file.permissions
        })
    except SharedFile.DoesNotExist:
        return Response({"error": "Shared link not found."}, status=404)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_file(request):
    print("Share file endpoint hit")
    file_id = request.data.get('file_id')
    share_with = request.data.get('share_with')  # List of emails
    print(f"File ID: {file_id}")
    print(f"Request User: {request.user}")

    if not file_id:
        return Response({"error": "File ID is required."}, status=400)

    if not isinstance(share_with, list):
        return Response({"error": "'share_with' must be a list of emails."}, status=400)

    permissions = request.data.get('permissions', 'read')

    # Validate file
    try:
        # Check ownership explicitly
        file = File.objects.get(id=file_id)
        if file.user != request.user:
            print(f"File with ID {file_id} is not owned by user {request.user}")
            return Response({"error": "Unauthorized to access this file."}, status=403)

        print(f"File fetched successfully: {file}")
    except File.DoesNotExist:
        print(f"File with ID {file_id} not found.")
        return Response({"error": "File not found."}, status=404)

    # Share file with each user
    share_links = []
    for email in share_with:
        shared_file = SharedFile.objects.create(
            file=file,
            shared_with=email,
            permissions=permissions
        )
        share_link = request.build_absolute_uri(
            reverse('shared_file_detail', kwargs={'share_link': shared_file.share_link})
        )
        share_links.append({
            "shared_with": email,
            "share_link": share_link,
            "permissions": permissions
        })

    return Response({"file_id": file_id, "share_links": share_links}, status=201)

# File Upload
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file = request.FILES.get('file')
        name = request.data.get('name')
        user = request.user 
        
        if not file:
            return Response({"error": "No file provided."}, status=400)

        if not name:
            # If the name is not provided, use the file name
            name = file.name

        if not name:
            return Response({"error": "File name is required."}, status=400)

        # Create the file instance, and populate name, size, and user correctly
        file_instance = File.objects.create(
            name=name,
            file=file,
            size=file.size,  # This should automatically get the size of the uploaded file
            user=user
        )

        return Response({
            "message": "File uploaded successfully!",
            "file_url": file_instance.file.url,  # return the file URL after uploading
            "file_id": file_instance.id,
            "file_name": file_instance.name,
            "file_size": file_instance.size,
            "file_user": file_instance.user.id
        }, status=201)


class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return File.objects.filter(user=self.request.user, is_deleted=False)


# List user-uploaded files
class FileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        files = File.objects.filter(user=request.user)
        serializer = FileSerializer(files, many=True)
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    if request.method == 'POST':
        file = request.FILES.get('file')  # This is the uploaded file
        size = file.size  # Get the size of the file
        user = request.user  # Assuming the user is logged in and associated with the file

        # Create the File instance, using the correct fields
        file_instance = File.objects.create(file=file, size=size, owner=user)

        # Serialize and return the response
        serializer = FileSerializer(file_instance)
        return Response(serializer.data)

def get(self, request, *args, **kwargs):
    files = File.objects.all()
    logger.info(f"Fetched files: {files}")
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)

#delete function
@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])  # Ensure the user is authenticated
def delete_file(request, id):
    try:
        # Get the file by its ID
        file = File.objects.get(id=id)
        user = request.user  # Get the authenticated user

        # Record the deletion in the DeletedFile model
        DeletedFile.objects.create(
            user_id=user.id,  # Use the authenticated user's ID
            file_name=file.name,  # Adjust to your model field
            deleted_at=timezone.now()  # Correctly use timezone.now()
        )

        # Proceed with deleting the file
        file.delete()
        return JsonResponse({'message': 'File deleted successfully'}, status=200)

    except File.DoesNotExist:
        return JsonResponse({'error': 'File not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

# fetch delete file
@api_view(['GET'])
@csrf_exempt
def get_deleted_files(request):
    user_id = request.GET.get('userId')
    if not user_id or not user_id.isdigit():
        return Response({"error": "Invalid user ID"}, status=400)

    try:
        deleted_files = DeletedFile.objects.filter(user_id=user_id)
        serializer = DeletedFilesSerializer(deleted_files, many=True)
        return Response(serializer.data, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
# Restore deleted file
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restore_file(request, id):
    deleted_file = get_object_or_404(DeletedFile, id=id)
    File.objects.create(
        user_id=deleted_file.user_id,
        name=deleted_file.file_name
    )
    deleted_file.delete()
    return Response({"message": "File restored successfully."}, status=200)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def permanently_delete(request, id):
    deleted_file = get_object_or_404(DeletedFile, id=id)
    deleted_file.delete()
    return Response({"message": "File permanently deleted."}, status=200)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def empty_trash(request):
    DeletedFile.objects.filter(user=request.user).delete()
    return Response({"message": "Trash emptied successfully."}, status=200)

