from django.db import models
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