# Generated by Django 5.1.2 on 2024-11-16 01:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0002_file'),
    ]

    operations = [
        migrations.DeleteModel(
            name='TestModel',
        ),
        migrations.RemoveField(
            model_name='file',
            name='uploaded_at',
        ),
        migrations.AddField(
            model_name='file',
            name='name',
            field=models.CharField(default='Unnamed File', max_length=255),
            preserve_default=False,
        ),
    ]