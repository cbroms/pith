from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))
schema = {}


with open(path + "/discussion/requests/create_user.json") as file:
  schema["create_user"] = load(file)

with open(path + "/discussion/requests/join.json") as file:
  schema["join"] = load(file)

with open(path + "/discussion/requests/load_unit_page.json") as file:
  schema["load_unit_page"] = load(file)

with open(path + "/discussion/requests/get_ancestors.json") as file:
  schema["get_ancestors"] = load(file)

with open(path + "/discussion/requests/get_unit_content.json") as file:
  schema["get_unit_content"] = load(file)

with open(path + "/discussion/requests/get_unit_context.json") as file:
  schema["get_unit_context"] = load(file)

with open(path + "/discussion/requests/post.json") as file:
  schema["post"] = load(file)

with open(path + "/discussion/requests/search.json") as file:
  schema["search"] = load(file)

with open(path + "/discussion/requests/send_to_doc.json") as file:
  schema["send_to_doc"] = load(file)

with open(path + "/discussion/requests/move_cursor.json") as file:
  schema["move_cursor"] = load(file)

with open(path + "/discussion/requests/hide_unit.json") as file:
  schema["hide_unit"] = load(file)

with open(path + "/discussion/requests/unhide_unit.json") as file:
  schema["unhide_unit"] = load(file)

with open(path + "/discussion/requests/add_unit.json") as file:
  schema["add_unit"] = load(file)

with open(path + "/discussion/requests/select_unit.json") as file:
  schema["select_unit"] = load(file)

with open(path + "/discussion/requests/deselect_unit.json") as file:
  schema["deselect_unit"] = load(file)

with open(path + "/discussion/requests/move_units.json") as file:
  schema["move_units"] = load(file)

with open(path + "/discussion/requests/merge_units.json") as file:
  schema["merge_units"] = load(file)

with open(path + "/discussion/requests/request_to_edit.json") as file:
  schema["request_to_edit"] = load(file)

with open(path + "/discussion/requests/deedit_unit.json") as file:
  schema["deedit_unit"] = load(file)

with open(path + "/discussion/requests/edit_unit.json") as file:
  schema["edit_unit"] = load(file)
