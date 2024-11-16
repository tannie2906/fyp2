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

@api_view(['POST'])
def file_upload(request):
    parser_classes = (MultiPartParser, FormParser)
    
    if request.method == 'POST':
        file_obj = request.FILES.get('file')

        if not file_obj:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)

        # Save the file using default storage
        file_path = default_storage.save(file_obj.name, file_obj)
        file_url = settings.MEDIA_URL + file_obj.name

        return Response({'file_path': file_path, 'file_url': file_url}, status=status.HTTP_201_CREATED)

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]  # Make sure the user is authenticated
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        file = request.FILES.get('file')
        if not file:
            return Response({"error": "No file provided."}, status=400)

        # Construct the full path to save the file
        upload_path = os.path.join(settings.MEDIA_ROOT, 'uploads', file.name)
        try:
            os.makedirs(os.path.dirname(upload_path), exist_ok=True)  # Create directories if not exist

            # Save the file
            with open(upload_path, 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)

            # Construct the file URL for response
            file_url = settings.MEDIA_URL + 'uploads/' + file.name

            return Response({"message": "File uploaded successfully!", "file_url": file_url}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

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

### Registration View
class RegisterUserView(APIView):
    permission_classes = [AllowAny]  # Ensure registration is public

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create and save the new user
        user = User.objects.create_user(username=username, password=password)
        user.save()

        # Generate token for the new user
        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "message": "User registered successfully",
            "token": token.key  # Include the token in the response
        }, status=status.HTTP_201_CREATED)