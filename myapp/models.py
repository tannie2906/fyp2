from django.contrib.auth.models import User
from django.utils.timezone import now
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
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    size = models.PositiveIntegerField(null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)  
    is_deleted = models.BooleanField(default=False) 

    def __str__(self):
        return self.file.name

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
    filename = models.CharField(max_length=100)
    file = models.FileField(upload_to='uploads/')  # Directory where files are saved
    upload_date = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)

    is_deleted = models.BooleanField(default=False)  # Soft delete flag  # New field to mark deleted files

    def __str__(self):
        return self.filename
    
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
    user_id = models.IntegerField()
    file_name = models.CharField(max_length=255)  # Ensure this field exists
    deleted_at = models.DateTimeField(default=now)


    def __str__(self):
        return self.file_name