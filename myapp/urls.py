from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomAuthToken, ProfileView, SettingsView, FileUploadView, FileListView
from . import views
from django.shortcuts import render
from rest_framework.authtoken.views import obtain_auth_token
from .views import RegisterUserView
from .views import get_file_url
from myapp.views import file_upload, get_user_files, CustomAuthToken, RegisterUserView

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
    path('files/', views.list_uploaded_files, name='list_uploaded_files'),
    path('files/', get_user_files, name='get_user_files'),
     path('files/', FileListView.as_view(), name='file-list'),
]
