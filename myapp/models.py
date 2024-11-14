from django.db import models

class TestModel(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    

    def __str__(self):
        return self.name

class File(models.Model):
    file = models.FileField(upload_to='uploads/')  # Files will be uploaded to MEDIA_ROOT/uploads/
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name