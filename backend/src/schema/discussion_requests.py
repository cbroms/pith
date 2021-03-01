from json import load
import os

from utils import utils


path = os.path.dirname(os.path.realpath(__file__))
schema = {}
schema_names = [
    "join_disc",
    "load_disc",
    "load_chat_page",
    "leave_disc",
    "post",
    "add_pinned",
    "remove_pinned",
    "add_focused",
    "remove_focused",
]

for schema_name in schema_names:
  with open(path + "/discussion/requests/{}.json".format(schema_name)) as file:
    schema[schema_name] = utils.absolute_file(load(file), path)
