from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static
from myapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),  # Include app-specific URLs
    re_path(r'^$', serve, {'path': 'index.html', 'document_root': settings.BASE_DIR / 'frontend/dist/frontend'}),
    path('files/', views.FileListView.as_view(), name='file-list'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
