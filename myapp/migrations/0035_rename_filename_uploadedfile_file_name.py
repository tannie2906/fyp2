# Generated by Django 5.1.2 on 2024-12-20 00:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0034_file_created_at'),
    ]

    operations = [
        migrations.RenameField(
            model_name='uploadedfile',
            old_name='filename',
            new_name='file_name',
        ),
    ]