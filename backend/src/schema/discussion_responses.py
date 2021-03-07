from json import load
import os

from utils import utils


path = os.path.dirname(os.path.realpath(__file__))
schema = {}
schema_names = [
    "join_disc",
    "leave_disc",
    "load_disc",
    "load_chat_page",
    "post",
    "add_pinned",
    "remove_pinned",
    "add_focused",
    "remove_focused",
    "search",
    "typing_start",
    "typing_stop",
]

for schema_name in schema_names:
  with open(path + "/discussion/responses/{}.json".format(schema_name)) as file:
    schema[schema_name] = utils.absolute_file(load(file), path)
