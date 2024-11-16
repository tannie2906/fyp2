from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static
from myapp.views import file_upload, get_user_files, CustomAuthToken, RegisterUserView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),  # API paths
    path('upload/', file_upload, name='file_upload'),
    path('files/', get_user_files, name='get_user_files'),
    path('login/', CustomAuthToken.as_view(), name='custom_auth_token'),
    path('register/', RegisterUserView.as_view(), name='register_user'),
   re_path(r'^$', serve, {'path': 'index.html', 'document_root': settings.BASE_DIR / 'frontend/dist/frontend'}),
] 

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)