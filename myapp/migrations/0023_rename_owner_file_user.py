# Generated by Django 5.1.2 on 2024-12-18 22:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0022_rename_user_file_owner'),
    ]

    operations = [
        migrations.RenameField(
            model_name='file',
            old_name='owner',
            new_name='user',
        ),
    ]