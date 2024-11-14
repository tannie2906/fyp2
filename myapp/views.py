from rest_framework import viewsets
from .models import TestModel
from .serializers import TestModelSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from .serializers import UserSerializer
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token

class TestModelViewSet(viewsets.ModelViewSet):
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    # This should ensure your API returns JSON, not HTML.

class CustomAuthToken(ObtainAuthToken):
    pass

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
