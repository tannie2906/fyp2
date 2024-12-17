from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeletedFilesView, FileUploadView, FileListView, CustomAuthToken, ProfileView, RegisterUserView, delete_file
from .views import FileViewSet
from .views import rename_file
from . import views
from .views import download_file
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'files', FileViewSet)

urlpatterns = [
    path('upload/', FileUploadView.as_view(), name='file-upload'),
    path('files/', FileListView.as_view(), name='file-list'),
    path('files/deleted/', DeletedFilesView.as_view(), name='deleted-files'),  # New route
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('files/<int:file_id>/rename', rename_file, name='rename_file'),
    path('files/<int:file_id>/', delete_file, name='delete_file'), 
    path('files/download/<int:file_id>/', download_file, name='download_file'),
    path('token-auth/', TokenObtainPairView.as_view(), name='api_token_auth'),
    path('token-refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]