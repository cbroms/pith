from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))
schema = {}

schema_names = [
  "created_user",
  "joined_user",
  "left_user",
  "loaded_user",
  "loaded_unit_page",
  "get_ancestors",
  "get_unit_content",
  "get_unit_context",
  "created_post",
  "search",
  "moved_cursor",
  "hid_unit",
  "unhid_unit",
  "added_unit",
  "locked_unit_position",
  "unlocked_unit_position",
  "repositioned_unit",
  "locked_unit_editable",
  "unlocked_unit_editable",
  "edited_unit",
  "removed_backlinks",
  "added_backlinks",
]

for schema_name in schema_names:
  with open(path + "/discussion/responses/{}.json".format(schema_name)) as file:
    schema[schema_name] = load(file)
