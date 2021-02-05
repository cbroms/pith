from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))
schema = {}
schema_names = [
    "join_board",
    "create_user",
    "load_board",
    "add_unit",
    "remove_unit",
    "edit_unit",
    "add_link",
    "remove_link",
    "get_unit",
    "create_disc",
]


for schema_name in schema_names:
  with open(path + "/board/requests/{}.json".format(schema_name)) as file:
    schema[schema_name] = load(file)

