from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomAuthToken, ProfileView, SettingsView, FileUploadView
from . import views
from django.shortcuts import render
from rest_framework.authtoken.views import obtain_auth_token
from .views import RegisterUserView

def index(request):
    return render(request, 'index.html')

router = DefaultRouter()

urlpatterns = [
    path('', index, name='home'),
    path('api/', include(router.urls)),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('login/', obtain_auth_token, name='api_login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('files/', views.list_files, name='file-list'),
    path('register/', RegisterUserView.as_view(), name='register'),
]
