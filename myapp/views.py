from rest_framework import viewsets
from .models import TestModel
from .serializers import TestModelSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .serializers import UserSerializer
from django.contrib.auth import authenticate
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status

class TestModelViewSet(viewsets.ModelViewSet):
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    permission_classes = [IsAuthenticated]
    # This should ensure your API returns JSON, not HTML.

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
        # Optionally, you can customize the behavior here
        # Call the parent class method to authenticate and return the token
        response = super().post(request, *args, **kwargs)
        
        # Custom logic (if any) can be added here
        
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
