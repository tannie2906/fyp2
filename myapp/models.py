from django.contrib.auth.models import User
from django.utils import timezone
from django.utils.timezone import now
from django.utils.text import slugify
from django.db import models
from django import forms
import uuid
import os

def custom_file_name(instance, filename):
    # Extract file extension
    _, ext = os.path.splitext(filename)
    # Use the custom name provided in the 'name' field
    return os.path.join('uploads/', f"{instance.name}{ext}")

# handling upload file with custom name and storage
class File(models.Model):
    id = models.AutoField(primary_key=True)
    file = models.FileField(upload_to='uploads/')
    user_id = models.IntegerField()
    file_name = models.CharField(max_length=255)
    deleted_at = models.DateTimeField(null=True, blank=True)
    size = models.IntegerField()
    is_deleted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_starred = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        # Rename the file to the custom name while preserving the extension
        if self.file and self.file_name:
            extension = os.path.splitext(self.file.name)[1]  # Get the file extension
            custom_name = f"{slugify(self.file_name)}{extension}"  # Slugify for safety
            self.file.name = custom_name
        super().save(*args, **kwargs)

    def __str__(self):
        return self.file_name

# sharing files with specific users.
class SharedFile(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name="shared_files")
    shared_with = models.EmailField()  # User email
    share_link = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    permissions = models.CharField(max_length=10, choices=[("read", "Read"), ("edit", "Edit")])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Shared {self.file.name} with {self.shared_with}"
    
class UploadedFile(models.Model):
    file_name = models.CharField(max_length=100)
    file = models.FileField(upload_to='uploads/')  # Directory where files are saved
    upload_date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    is_deleted = models.BooleanField(default=False)  # Soft delete flag  # New field to mark deleted files

    def __str__(self):
        return self.file_name
    
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    # Add other fields as needed
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    email = models.EmailField(max_length=254, blank=True)

    def __str__(self):
        return self.user.username  

class CustomUserCreationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if not email:
            raise forms.ValidationError("Email is required")
        return email
            
class DeletedFile(models.Model):
    id = models.AutoField(primary_key=True)
    file = models.FileField(upload_to='uploads/') 
    user_id = models.IntegerField()
    file_name = models.CharField(max_length=255) 
    deleted_at = models.DateTimeField(default=now)
    size = models.IntegerField()

    def __str__(self):
        return self.file_name