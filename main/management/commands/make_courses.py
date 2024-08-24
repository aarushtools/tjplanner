import json

from django.core.management import BaseCommand
from django.db.models import Count
from fcps_insys_api.utils.main import InsysAPI

from main.models import Course, Category


class Command(BaseCommand):
    help = "Fill database with courses (and categories)"

    def handle(self, *args, **kwargs):
        Course.objects.all().delete()
        Category.objects.all().delete()

        insys_api = InsysAPI(location_id=503)
        courses = insys_api.get_course_list()["data"]

        for i in range(len(courses["categories"])):
            cat_courses = courses["categories"][i]
            category = Category.objects.create(name=cat_courses["category_name"])
            for c in range(len(cat_courses["courses"])):

                course = cat_courses["courses"][c]
                course_detailed_info = insys_api.get_course_detailed_info(course["id"])["data"]["course"]

                prereqs = course_detailed_info["prerequisites"]
                coreqs = course_detailed_info["corequisites"]

                if course["name"].find("TJ") != -1:
                    prereq_ids_dict = {
                        "optional": [],
                        "required": [],
                    }
                    coreq_ids_dict = {
                        "optional": [],
                        "required": [],
                    }
                    prereq_ids = input(f"Prereqs: {prereqs}. Comma separated list, no spaces, of course ids corresponding "
                                       f"to these reqs. Prefix with opt: to indicate only one should be satisfied").split(",") if prereqs else None
                    coreq_ids = input(f"Coreqs: {coreqs}. Comma separated list, no spaces, of course ids corresponding "
                                      f"to these reqs. Prefix with opt: to indicate only one should be satisfied").split(",") if coreqs else None

                    if prereq_ids is not None:
                        for val in prereq_ids:
                            if val.startswith("opt:"):
                                prereq_ids_dict["optional"].append(val[4:])
                            else:
                                prereq_ids_dict["required"].append(val)
                        prereq_ids = json.dumps(prereq_ids_dict)

                    if coreq_ids is not None:
                        for val in coreq_ids_dict:
                            if val.startswith("opt:"):
                                coreq_ids_dict["optional"].append(val[4:])
                            else:
                                coreq_ids_dict["required"].append(val)
                        coreq_ids = json.dumps(coreq_ids_dict)

                else:
                    prereq_ids = None
                    coreq_ids = None

                Course.objects.create(
                    name=course["name"],
                    category=category,
                    course_id=course_detailed_info["number"],
                    credit=course["credit"],
                    weight=course["weight"],
                    course_type=get_weight_type(course),
                    course_offered=get_offered_type(course),
                    grades_list=json.dumps(course["grades_offered"]),
                    description=course_detailed_info["description"],
                    description_bold=course_detailed_info["description_bold"],
                    header_note=course_detailed_info["header_note"],
                    prerequisites=course_detailed_info["prerequisites"],
                    corequisites=course_detailed_info["corequisites"],
                    prereq_ids=prereq_ids,
                    coreq_ids=coreq_ids,
                    number=course_detailed_info["id"],
                )

                print(f"Created course {course["name"]}")

        print("Created courses")

        for course in Course.objects.all():
            if not course.prereq_ids:
                course.prereq_ids = "None"
            if not course.coreq_ids:
                course.coreq_ids = "None"
            course.save()

        # Delete dupes

        duplicate_course_ids = Course.objects.values("course_id").annotate(count=Count("id")).filter(count__gt=1)

        for entry in duplicate_course_ids:
            course_id = entry['course_id']
            duplicates = Course.objects.filter(course_id=course_id)
            duplicates.exclude(id=duplicates.first().id).delete()

            print(f"Duplicate deleted: {course_id}")

        print("Done")


def get_weight_type(course: dict) -> str:
    if course["is_ap"]:
        return Course.CourseWeightType.AP
    elif course["is_ib"]:
        return Course.CourseWeightType.IB
    elif course["is_de"]:
        return Course.CourseWeightType.DE
    elif course["weight"] == 1.0:
        return Course.CourseWeightType.POST
    elif course["weight"] == 0.5:
        return Course.CourseWeightType.HN
    else:
        return Course.CourseWeightType.NONE


def get_offered_type(course: dict) -> str:
    match course["type"]:
        case "Core":
            return Course.CourseOfferedType.CORE
        case "Academy":
            return Course.CourseOfferedType.ACADEMY
        case "Online":
            return Course.CourseOfferedType.ONLINE
