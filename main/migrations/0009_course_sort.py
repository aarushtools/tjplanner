# Generated by Django 5.1 on 2024-11-19 05:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_course_number'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='sort',
            field=models.IntegerField(default=2),
            preserve_default=False,
        ),
    ]