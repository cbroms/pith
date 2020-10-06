from json import load
import os


path = os.path.dirname(os.path.realpath(__file__))


with open(path + "/discussion/responses/create_user.json") as file:
  create_user = load(file)

with open(path + "/discussion/responses/join.json") as file:
  join = load(file)

with open(path + "/discussion/responses/leave.json") as file:
  leave = load(file)

"""
* **cursors** - Map of active user IDs to cursor positions. 
* **current_unit** - ID of the unit the user was last looking at.
* **timeline** - List of the units visited via the cursor.
* **chat_history** - List of the posts:

  * **created_at** - Creation time of unit. 
  * **author** - Nickname of the author.
  * **units** - List of unit IDs.
"""
with open(path + "/discussion/responses/load_user.json") as file:
  load_user = load(file)

"""
- **pith** - Pith of the unit.
- **ancestors** - Ancestors of the unit, including self.
- **children** - List of tuples, where each tuple has a children unit ID and the list of children for that unit.
- **backlinks** - List of tuples, where each tuple has a backlink unit ID and the list of backlinks for that unit.
"""
with open(path + "/discussion/responses/get_unit_page.json") as file:
  get_unit_page = load(file)

"""
- ancestors - List of ancestor unit IDs, from most recent to oldest.
"""
with open(path + "/discussion/responses/get_ancestors.json") as file:
  get_ancestors = load(file)

"""
- **pith** - Pith of the unit.
- **hidden** - Whether the unit is hidden, default false. 
"""
with open(path + "/discussion/responses/get_unit_content.json") as file:
  get_unit_content = load(file)

"""
- **pith** - Pith of the unit.
- **children** - List of children unit IDs. 
"""
with open(path + "/discussion/responses/get_unit_context.json") as file:
  get_unit_context = load(file)

"""
- **created_at** - Creation time of unit. 
- **author** - Nickname of the author. 
- **piths** - List of pith strings, one per unit.
"""
with open(path + "/discussion/responses/post.json") as file:
  post = load(file)

"""
- **units** - List of unit IDs, sorted in order of relevance.
"""
with open(path + "/discussion/responses/search.json") as file:
  search = load(file)

with open(path + "/discussion/responses/move_cursor.json") as file:
  move_cursor = load(file)

with open(path + "/discussion/responses/hide_unit.json") as file:
  hide_unit = load(file)

with open(path + "/discussion/responses/unhide_unit.json") as file:
  unhide_unit = load(file)

"""
- **unit_id** - Unit ID.
- **pith** - Pith of the unit.
- **created_at** - Creation time of unit. 
- **parent** - Parent unit ID unit was added to.
- **position** - Index of unit in parent.
"""
with open(path + "/discussion/responses/added_unit.json") as file:
  added_unit = load(file)

"""
- **unit_id** - Unit ID.
- **nickname** - Nickname of user with unit's position lock.
"""
with open(path + "/discussion/responses/locked_unit_position.json") as file:
  locked_unit_position = load(file)

"""
- **unit_id** - Unit ID.
- **parent** - Parent unit ID.
- **position** - Position of unit in parent unit.
- **old_parent** - Old parent unit ID.
- **old_position** - Position of unit in old parent unit.
"""
with open(path + "/discussion/responses/repositioned_unit.json") as file:
  repositioned_unit = load(file)

"""
- **unit_id** - Unit ID.
- **nickname** - Nickname of user holding the edit lock.
"""
with open(path + "/discussion/responses/locked_unit_editable.json") as file:
  locked_unit_editable = load(file)

"""
- **unit_id** - Unit ID.
- **pith** - Pith of the unit.
"""
with open(path + "/discussion/responses/edited_unit.json") as file:
  edited_unit = load(file)

with open(path + "/discussion/responses/removed_backlinks.json") as file:
  removed_backlinks = load(file)

with open(path + "/discussion/responses/added_backlinks.json") as file:
  added_backlinks = load(file)
