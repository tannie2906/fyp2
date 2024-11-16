from django.db import models
import os

class File(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')  # Ensure 'uploads/' is valid and writable

    def __str__(self):
        return self.name