from rest_framework import viewsets
#from .models import TestModel
#from .serializers import TestModelSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework import status
from .models import File
from .serializers import FileSerializer
from .serializers import UserRegistrationSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import parser_classes, api_view
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions
from django.http import JsonResponse
from django.conf import settings
from django.contrib.auth.models import User
import os
from django.core.files.storage import default_storage
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from .models import UploadedFile  # Your file model
from .serializers import FileSerializer 
from django.core.files.storage import default_storage
from django.shortcuts import render

# file upload API
@api_view(['POST'])
def file_upload(request):
    parser_classes = (MultiPartParser, FormParser)
    file_obj = request.FILES.get('file')
    
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save the file using default storage
    file_path = default_storage.save(file_obj.name, file_obj)
    file_url = settings.MEDIA_URL + file_obj.name
    return Response({'file_path': file_path, 'file_url': file_url}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def file_upload(request):
    parser_classes = (MultiPartParser, FormParser)
    file_obj = request.FILES.get('file')
    
    if not file_obj:
        return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Save the file using default storage
    file_path = default_storage.save(file_obj.name, file_obj)
    file_url = settings.MEDIA_URL + file_obj.name
    return Response({'file_path': file_path, 'file_url': file_url}, status=status.HTTP_201_CREATED)

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Save the file
        uploaded_file = UploadedFile.objects.create(file=file, owner=request.user)  # Assuming file model with owner
        file_url = settings.MEDIA_URL + uploaded_file.file.name

        return Response({"message": "File uploaded successfully!", "file_url": file_url}, status=status.HTTP_201_CREATED)


class FileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        files = UploadedFile.objects.filter(owner=request.user)  # Get files of the authenticated user
        serializer = FileSerializer(files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CustomAuthToken(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        # Authenticate the user
        user = authenticate(request, username=username, password=password)

        if user is not None:
            # Generate token for user
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        
class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)  # Call the parent method to get the token
        
        if response.status_code == 200:
            # Optionally customize the response if needed, e.g., include username or other user details
            token = response.data['token']
            return Response({
                'token': token
            })
        return response

class ProfileView(APIView):
    authentication_classes = [TokenAuthentication]  # Token-based authentication
    permission_classes = [IsAuthenticated]         # Ensure the user is authenticated

    def get(self, request):
        try:
            serializer = UserSerializer(request.user)  # Serialize the logged-in user's details
            return Response(serializer.data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request):
        user = request.user
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()
        return Response({"message": "Profile updated successfully"})

class SettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Here, you can return the user's settings
        return Response({"message": "User settings retrieved"})

    def put(self, request):
        # Update user settings if any
        return Response({"message": "Settings updated successfully"})

def list_files(request):
    # List files in the media directory
    media_path = settings.MEDIA_ROOT
    files = os.listdir(media_path)  # List files in the media folder
    file_list = [file for file in files if os.path.isfile(os.path.join(media_path, file))]
    
    return JsonResponse({'files': file_list})

# Registration View
class RegisterUserView(APIView):
    permission_classes = [AllowAny]  # Ensure registration is public

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create and save the new user
        user = User.objects.create_user(username=username, password=password, email=email, first_name=first_name, last_name=last_name)
        user.save()

        # Generate token for the new user
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "message": "User registered successfully",
            "token": token.key  # Include the token in the response
        }, status=status.HTTP_201_CREATED)
    
    # View to list all uploaded files in the media folder
def list_uploaded_files(request):
    media_path = settings.MEDIA_ROOT  # Path to the media folder
    files = os.listdir(media_path)  # List files in the media folder
    file_list = [file for file in files if os.path.isfile(os.path.join(media_path, file))]
    return JsonResponse({'files': file_list})

def get_file_url(request):
    # Example logic for returning a file URL
    return JsonResponse({"message": "File URL functionality not implemented yet."})

def get_user_files(request):
    # Replace this with your actual logic to get user files
    files = []  # Example: Retrieve files from your database
    return JsonResponse(files, safe=False)

