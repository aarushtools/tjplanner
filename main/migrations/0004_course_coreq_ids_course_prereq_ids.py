# Generated by Django 5.1 on 2024-08-18 20:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_alter_course_course_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='coreq_ids',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='course',
            name='prereq_ids',
            field=models.TextField(blank=True),
        ),
    ]
