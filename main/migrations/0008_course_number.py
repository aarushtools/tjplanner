# Generated by Django 5.1 on 2024-08-24 14:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_alter_course_coreq_ids_alter_course_prereq_ids'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='number',
            field=models.CharField(default='abc', max_length=8),
            preserve_default=False,
        ),
    ]
