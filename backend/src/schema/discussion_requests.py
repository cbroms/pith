from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))


with open(path + "/discussion/requests/create_user.json") as file:
  create_user = load(file)

with open(path + "/discussion/requests/join.json") as file:
  join = load(file)

with open(path + "/discussion/requests/load_unit_page.json") as file:
  load_unit_page = load(file)

with open(path + "/discussion/requests/get_ancestors.json") as file:
  get_ancestors = load(file)

with open(path + "/discussion/requests/get_unit_content.json") as file:
  get_unit_content = load(file)

with open(path + "/discussion/requests/get_unit_context.json") as file:
  get_unit_context = load(file)

with open(path + "/discussion/requests/post.json") as file:
  post = load(file)

with open(path + "/discussion/requests/search.json") as file:
  search = load(file)

with open(path + "/discussion/requests/send_to_doc.json") as file:
  send_to_doc = load(file)

with open(path + "/discussion/requests/move_cursor.json") as file:
  move_cursor = load(file)

with open(path + "/discussion/requests/hide_unit.json") as file:
  hide_unit = load(file)

with open(path + "/discussion/requests/unhide_unit.json") as file:
  unhide_unit = load(file)

with open(path + "/discussion/requests/add_unit.json") as file:
  add_unit = load(file)

with open(path + "/discussion/requests/select_unit.json") as file:
  select_unit = load(file)

with open(path + "/discussion/requests/move_units.json") as file:
  move_units = load(file)

with open(path + "/discussion/requests/merge_units.json") as file:
  merge_units = load(file)

with open(path + "/discussion/requests/request_to_edit.json") as file:
  request_to_edit = load(file)

with open(path + "/discussion/requests/edit_unit.json") as file:
  edit_unit = load(file)
