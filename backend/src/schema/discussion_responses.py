from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))
schema = {}

schema_names = [
  "created_user",
  "joined_user",
  "left_user",
  "loaded_unit_page",
  "get_ancestors",
  "get_unit_content",
  "get_unit_context",
  "created_post",
  "search",
  "set_cursor",
  "added_unit",
  "sent_to_doc",
  "merged_units",
  "doc_meta",
  "chat_meta"
]

for schema_name in schema_names:
  with open(path + "/discussion/responses/{}.json".format(schema_name)) as file:
    schema[schema_name] = load(file)
