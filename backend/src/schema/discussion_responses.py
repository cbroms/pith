from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))
schema = {}


with open(path + "/discussion/responses/created_user.json") as file:
  schema["created_user"] = load(file)

with open(path + "/discussion/responses/joined_user.json") as file:
  schema["joined_user"] = load(file)

with open(path + "/discussion/responses/left_user.json") as file:
  schema["left_user"] = load(file)

with open(path + "/discussion/responses/loaded_user.json") as file:
  schema["loaded_user"] = load(file)

with open(path + "/discussion/responses/loaded_unit_page.json") as file:
  schema["loaded_unit_page"] = load(file)

with open(path + "/discussion/responses/get_ancestors.json") as file:
  schema["get_ancestors"] = load(file)

with open(path + "/discussion/responses/get_unit_content.json") as file:
  schema["get_unit_content"] = load(file)

with open(path + "/discussion/responses/get_unit_context.json") as file:
  schema["get_unit_context"] = load(file)

with open(path + "/discussion/responses/created_post.json") as file:
  schema["created_post"] = load(file)

with open(path + "/discussion/responses/search.json") as file:
  schema["search"] = load(file)

with open(path + "/discussion/responses/moved_cursor.json") as file:
  schema["moved_cursor"] = load(file)

with open(path + "/discussion/responses/hid_unit.json") as file:
  schema["hid_unit"] = load(file)

with open(path + "/discussion/responses/unhid_unit.json") as file:
  schema["unhid_unit"] = load(file)

with open(path + "/discussion/responses/added_unit.json") as file:
  schema["added_unit"] = load(file)

with open(path + "/discussion/responses/locked_unit_position.json") as file:
  schema["locked_unit_position"] = load(file)

with open(path + "/discussion/responses/unlocked_unit_position.json") as file:
  schema["unlocked_unit_position"] = load(file)

with open(path + "/discussion/responses/repositioned_unit.json") as file:
  schema["repositioned_unit"] = load(file)

with open(path + "/discussion/responses/locked_unit_editable.json") as file:
  schema["locked_unit_editable"] = load(file)

with open(path + "/discussion/responses/unlocked_unit_editable.json") as file:
  schema["unlocked_unit_editable"] = load(file)

with open(path + "/discussion/responses/edited_unit.json") as file:
  schema["edited_unit"] = load(file)

with open(path + "/discussion/responses/removed_backlinks.json") as file:
  schema["removed_backlinks"] = load(file)

with open(path + "/discussion/responses/added_backlinks.json") as file:
  schema["added_backlinks"] = load(file)
