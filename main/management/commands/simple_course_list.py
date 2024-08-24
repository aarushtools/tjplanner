import json

from django.core.management import BaseCommand
from fcps_insys_api.utils.main import InsysAPI


class Command(BaseCommand):
    help = "Show simplified course list"

    def handle(self, *args, **kwargs):
        insys_api = InsysAPI(location_id=503)
        courses = insys_api.get_course_list()
        simple_course_list = insys_api.course_list_to_simple(courses)

        with open("output.txt", "w") as f:
            f.write(json.dumps(simple_course_list, indent=4))

        print("Done, output in tjplanner/output.txt")
