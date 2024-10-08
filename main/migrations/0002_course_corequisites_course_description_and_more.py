# Generated by Django 5.1 on 2024-08-17 19:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='corequisites',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='course',
            name='description',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='course',
            name='description_bold',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='course',
            name='header_note',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='course',
            name='prerequisites',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='course',
            name='course_type',
            field=models.CharField(choices=[('AP', 'AP'), ('IB', 'IB'), ('DE', 'DE'), ('HN', 'HN'), ('POST', 'POST'), ('NONE', 'NONE')], max_length=4),
        ),
    ]
