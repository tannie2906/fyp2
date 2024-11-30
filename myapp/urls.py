from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileUploadView, FileListView, CustomAuthToken, ProfileView, RegisterUserView
from .views import FileViewSet
from .views import rename_file
from . import views


router = DefaultRouter()
router.register(r'files', FileViewSet)

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('files/', FileListView.as_view(), name='file-list'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('files/<int:file_id>/rename', rename_file, name='rename_file'),
]
