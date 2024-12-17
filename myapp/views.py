from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework import viewsets
from rest_framework import permissions, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, permission_classes

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.http import JsonResponse, Http404
from django.http import HttpResponse, FileResponse
from django.conf import settings
from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage
from .models import UploadedFile
from .serializers import UserSerializer, FileSerializer, UserRegistrationSerializer, UploadedFileSerializer
from .models import File

import json
import logging 
import uuid  
import os

logger = logging.getLogger(__name__)


# File Upload
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        name = request.data.get('name')  # name provided by the user
        if not file:
            return Response({"error": "No file provided."}, status=400)
        if not name:
            name = file.name  # Default to original file name if name is not provided
        unique_filename = f"{uuid.uuid4().hex}_{name}"  # Generate unique filename
        uploaded_file = UploadedFile.objects.create(
            file=file,
            filename=unique_filename,  # Save the unique filename
            owner=request.user
        )
        return Response({
            "message": "File uploaded successfully!",
            "file_url": settings.MEDIA_URL + uploaded_file.file.name
        }, status=201)

class FileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        uploaded_files = UploadedFile.objects.filter(owner=request.user)
        serializer = UploadedFileSerializer(uploaded_files, many=True)
        return Response(serializer.data)
    
# In views.py
class FileViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        # Exclude deleted files from the default query
        return File.objects.filter(deleted=False)


# User Authentication
class CustomAuthToken(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key})
        return Response({"error": "Invalid credentials"}, status=400)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)  # Serialize the User model directly
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        return Response({"message": "Profile updated successfully"})

# Registration
class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"message": "User registered successfully", "token": token.key}, status=201)
        return Response(serializer.errors, status=400)
    

# view to retrieve only the deleted files for auth user    
class DeletedFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only show deleted files for the logged-in user
        deleted_files = UploadedFile.objects.filter(owner=request.user, is_deleted=True)
        serializer = UploadedFileSerializer(deleted_files, many=True)
        return Response(serializer.data)

class FolderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Ensure we're only returning files that are not deleted
        files = UploadedFile.objects.filter(owner=request.user, is_deleted=False)
        serializer = UploadedFileSerializer(files, many=True)
        return Response(serializer.data)

# List Files
@api_view(['GET'])
def list_uploaded_files(request):
    media_path = settings.MEDIA_ROOT
    files = [file for file in os.listdir(media_path) if os.path.isfile(os.path.join(media_path, file))]
    return JsonResponse({'files': files})

#for user to look at their own file
class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    permission_classes = [permissions.IsAuthenticated]  # Ensure the user is authenticated

    def get_queryset(self):
        # Only show files for the logged-in user
        return File.objects.filter(user=self.request.user)
    
@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def rename_file(request, file_id):
    try:
        data = json.loads(request.body)
        new_name = data.get('newName')

        if not new_name:
            return JsonResponse({'error': 'New name is required.'}, status=400)

        file = UploadedFile.objects.get(id=file_id, owner=request.user)

        # Check if the new name already exists for the user
        if UploadedFile.objects.filter(owner=request.user, filename=new_name).exists():
            return JsonResponse({'error': 'A file with this name already exists.'}, status=400)

        file.filename = new_name
        file.save()
        return JsonResponse({'message': 'File renamed successfully.'})

    except UploadedFile.DoesNotExist:
        return JsonResponse({'error': 'File not found or not owned by the user.'}, status=404)
    except Exception as e:
        logger.exception(f"Unhandled exception in rename_file: {e}")
        return JsonResponse({'error': f'Internal server error: {e}'}, status=500)


@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_file(request, file_id):
    try:
        file = UploadedFile.objects.get(id=file_id, owner=request.user)  # Ensure only owner can delete
        file.is_deleted = True  # Mark the file as deleted
        file.save()
        return JsonResponse({"message": "File successfully deleted."})

    except UploadedFile.DoesNotExist:
        return JsonResponse({"error": "File not found or not owned by the user."}, status=404)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_folder_files(request):
    try:
        files = UploadedFile.objects.filter(owner=request.user, is_deleted=False)  # Exclude deleted files
        file_data = [{"id": file.id, "filename": file.filename, "upload_date": file.upload_date} for file in files]
        return JsonResponse(file_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': f'Internal server error: {e}'}, status=500)
    
@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_deleted_files(request):
    try:
        files = UploadedFile.objects.filter(owner=request.user, is_deleted=True)  # Only fetch deleted files
        file_data = [{"id": file.id, "filename": file.filename, "upload_date": file.upload_date} for file in files]
        return JsonResponse(file_data, safe=False)
    except Exception as e:
        return JsonResponse({'error': f'Internal server error: {e}'}, status=500)


@api_view(['GET'])
def profile_view(request):
    # This assumes you are using token authentication
    user = request.user
    profile = user.profile  # Profile linked to the user
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Use token authentication
def download_file(request, file_id):
    try:
        # Try to get the file by ID and verify ownership
        file = UploadedFile.objects.get(id=file_id, owner=request.user, is_deleted=False)
    except UploadedFile.DoesNotExist:
        logger.error(f"File with ID {file_id} not found or has been deleted.")
        return JsonResponse({'error': 'File not found or deleted.'}, status=404)

    # Check if the file exists on the filesystem
    file_path = file.file.path
    logger.info(f"Attempting to download file: {file_path}")

    if not os.path.exists(file_path):
        logger.error(f"File {file_path} does not exist on disk.")
        return JsonResponse({'error': 'File does not exist on disk.'}, status=500)

    # Return the file response
    try:
        response = FileResponse(open(file_path, 'rb'), content_type='application/octet-stream')
        response['Content-Disposition'] = f'attachment; filename="{file.filename}"'
        return response
    except Exception as e:
        logger.error(f"Error occurred while processing the file: {str(e)}")
        return JsonResponse({'error': f'Error occurred while processing the file: {str(e)}'}, status=500)