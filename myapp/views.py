from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from django.http import JsonResponse
from django.conf import settings
from django.core.files.storage import default_storage
from .models import UploadedFile
from .serializers import UserSerializer, FileSerializer, UserRegistrationSerializer, UploadedFileSerializer
from rest_framework import viewsets
from .models import File
from rest_framework import permissions, viewsets

# File Upload
class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided."}, status=400)
        uploaded_file = UploadedFile.objects.create(file=file, filename=file.name, owner=request.user)
        return Response({"message": "File uploaded successfully!", "file_url": settings.MEDIA_URL + uploaded_file.file.name}, status=201)

class FileListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        uploaded_files = UploadedFile.objects.filter(owner=request.user)
        serializer = UploadedFileSerializer(uploaded_files, many=True)
        return Response(serializer.data)

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
        serializer = UserSerializer(request.user)
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