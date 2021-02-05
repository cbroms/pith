from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))
schema = {}
schema_names = [
    "join_disc",
    "load_disc",
    "leave_disc",
    "post",
    "add_pinned",
    "remove_pinned",
    "add_focused",
    "remove_focused",
]

for schema_name in schema_names:
  with open(path + "/discussion/requests/{}.json".format(schema_name)) as file:
    schema[schema_name] = load(file)
