from json import load
import os

from utils import utils

path = os.path.dirname(os.path.realpath(__file__))
schema = {}
schema_names = [
    "join_board",
    "update_board",
    "create_user",
    "load_board",
    "add_unit",
    "remove_unit",
    "edit_unit",
    "add_link",
    "remove_link",
    "get_unit",
    "create_disc",
    "search",
]

for schema_name in schema_names:
  with open(path + "/board/responses/{}.json".format(schema_name)) as file:
    schema[schema_name] = utils.absolute_file(load(file), path)
