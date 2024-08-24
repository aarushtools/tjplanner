import json

from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return str(self.name)


class Course(models.Model):

    class CourseWeightType(models.TextChoices):
        AP = "AP", "AP"
        IB = "IB", "IB"
        DE = "DE", "DE"
        HN = "HN", "HN"
        POST = "POST", "POST"  # post-ap
        NONE = "NONE", "NONE"

    class CourseOfferedType(models.TextChoices):
        ONLINE = "ONLINE", "Online"
        ACADEMY = "ACADEMY", "Academy"
        CORE = "CORE", "Core"

    name = models.CharField(max_length=100)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    course_id = models.CharField(max_length=6)
    credit = models.DecimalField(max_digits=4, decimal_places=3)
    weight = models.DecimalField(max_digits=2, decimal_places=1)
    course_type = models.CharField(max_length=4, choices=CourseWeightType.choices)
    course_offered = models.CharField(max_length=7, choices=CourseOfferedType.choices)
    grades_list = models.TextField(blank=True)
    description = models.TextField(blank=True)
    description_bold = models.TextField(blank=True)
    header_note = models.TextField(blank=True)
    prerequisites = models.TextField(blank=True)
    corequisites = models.TextField(blank=True)
    prereq_ids = models.TextField(blank=True, null=True, default="None")
    coreq_ids = models.TextField(blank=True, null=True, default="None")
    number = models.CharField(max_length=8)

    @property
    def grades(self):
        return json.loads(self.grades_list)

    def __str__(self):
        return str(self.name)