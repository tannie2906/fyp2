from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FileDeleteView, FileUploadView, FileListView, CustomAuthToken, ProfileView, RegisterUserView, FileViewSet, UploadProfilePictureView,  DeletedFilesView
from .views import FileViewSet
from . import views
from .views import FileView, RestoreFileView, PermanentlyDeleteFilesView, DeletedFileDeleteView
from .views import FileRenameView, EmptyTrashView, DownloadFileAPIView, FileSearchView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='file')

urlpatterns = [
    path('api/', include(router.urls)),
    path('upload/', FileUploadView.as_view(), name='file-upload'),
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

    #path('delete/<int:id>/', views.delete_file, name='delete_file'), #this one from folder page
    #path('deleted-files', get_deleted_files, name='deleted-files'),

    #folder page
    path('files/view/<int:file_id>/', FileView.as_view(), name='file-view'),
    path('files/starred/', views.starred_files, name='starred_files'),
    path('files/toggle-star/<int:id>/', views.toggle_star, name='toggle_star'),
    path('rename/', FileRenameView.as_view(), name='file_rename'), 
    #path('files/download/<int:file_id>/', download_file, name='download_file'),
    path('files/download/<int:file_id>/', DownloadFileAPIView.as_view(), name='download_file'),

    path('delete/<int:id>/', DeletedFileDeleteView.as_view(), name='delete_file'),
    path('files/delete/<int:id>/', FileDeleteView.as_view(), name='delete_active_file'),

    #delete page
    path('restore-files/', RestoreFileView.as_view(), name='restore-files'),
    path('permanently-delete/<int:id>/', PermanentlyDeleteFilesView.as_view(), name='permanently_delete'),
    path('empty-trash/', EmptyTrashView.as_view(), name='empty_trash'),
    path('deleted-files/', DeletedFilesView.as_view(), name='deleted-files'),

    #app component
    path('apisearch/', FileSearchView.as_view(), name='apisearch')

]