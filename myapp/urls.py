from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileUploadView, FileListView, CustomAuthToken, ProfileView, RegisterUserView, FileViewSet, UploadProfilePictureView
from .views import FileViewSet
from . import views
from .views import FileView
from .views import download_file, rename_file, get_deleted_files
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='file')

urlpatterns = [
    path('api/', include(router.urls)),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
   # path('files/', FileListView.as_view(), name='file-list'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('token-auth/', TokenObtainPairView.as_view(), name='api_token_auth'),
    path('token-refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    #update setting
    path('settings/', views.get_settings, name='get_settings'),  # GET endpoint
    path('update-username', views.update_username, name='update_username'),
    path('update-profile', views.update_profile, name='update-profile'),
    path('upload-profile-picture/', UploadProfilePictureView.as_view(), name='upload-profile-picture'),

    path('files/', FileListView.as_view(), name='file-list'),
   
    path('files/share/', views.share_file, name='share_file'),
    path('files/shared/<str:share_link>/', views.shared_file_detail, name='shared_file_detail'),

    path('delete/<int:id>/', views.delete_file, name='delete_file'),
    path('deleted-files', get_deleted_files, name='deleted-files'),
    path('restore-file/<int:file_id>/', views.restore_file, name='restore-file'),
    path('permanently-delete/<int:id>/', views.permanently_delete, name='permanently_delete'),
    path('empty-trash/', views.empty_trash, name='empty_trash'),

    path('files/starred/', views.starred_files, name='starred_files'),
    path('files/toggle-star/<int:id>/', views.toggle_star, name='toggle_star'),
    path('files/<int:file_id>/rename/', rename_file, name='rename_file'),
    path('files/download/<int:file_id>/', download_file, name='download_file'),

    path('files/view/<int:file_id>/', FileView.as_view(), name='file-view'),
]