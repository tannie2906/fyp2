# Generated by Django 5.1.2 on 2024-12-20 04:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0036_file_is_starred'),
    ]

    operations = [
        migrations.AddField(
            model_name='file',
            name='file_path',
            field=models.FileField(default=0, upload_to='files/'),
            preserve_default=False,
        ),
    ]