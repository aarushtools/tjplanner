from django.shortcuts import render

from main.models import Course, Category


def index(request):
    context = {
        "courses": Course.objects.all(),
        "categories": Category.objects.all(),
        "course_list": [9, 10, 11, 12] * 9,
    }
    return render(request, "main/index.html", context=context)
