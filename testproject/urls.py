from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('myapp.urls')),  # API paths
    # Serve Angular's index.html directly
   re_path(r'^$', serve, {'path': 'index.html', 'document_root': settings.BASE_DIR / 'frontend/dist/frontend'}),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)