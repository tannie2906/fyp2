from django.db import models
from django import forms
import os
from django.contrib.auth.models import User

class File(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')  # Ensure 'uploads/' is valid and writable

    def __str__(self):
        return self.name
    
class UploadedFile(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/')
    filename = models.CharField(max_length=255)
    upload_date = models.DateTimeField(auto_now_add=True)

class CustomUserCreationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email:
            raise forms.ValidationError("Email is required")
        return email
        
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    # Add other fields as needed
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    email = models.EmailField(max_length=254, blank=True)

    def __str__(self):
        return self.user.username