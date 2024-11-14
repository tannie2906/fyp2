from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestModelViewSet
from .views import CustomAuthToken, ProfileView, SettingsView
from . import views
from django.shortcuts import render

def index(request):
    return render(request, 'index.html')

router = DefaultRouter()
router.register(r'testmodel', TestModelViewSet)

urlpatterns = [
    path('', index, name='home'),
    path('api/', include(router.urls)),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('upload/', views.file_upload, name='file-upload'),
]
