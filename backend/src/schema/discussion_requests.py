from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))
schema = {}

schema_names = [
  "test_connect",
  "create_user",
  "join",
  "load_unit_page",
  "get_ancestors",
  "get_unit_content",
  "get_unit_context",
  "post",
  "search",
  "send_to_doc",
  "move_cursor",
  "hide_unit",
  "unhide_unit",
  "add_unit",
  "select_unit",
  "deselect_unit",
  "move_units",
  "merge_units",
  "request_to_edit",
  "deedit_unit",
  "edit_unit",
]

for schema_name in schema_names:
  with open(path + "/discussion/requests/{}.json".format(schema_name)) as file:
    schema[schema_name] = load(file)
