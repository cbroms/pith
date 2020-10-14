#####################################
Pith Discussion Schema 
#####################################

*************************************
Discussion Requests
*************************************

.. _dreq_create_user-label:

create_user
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/create_user.json

.. _dreq_join-label:

join
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/join.json

.. _dreq_get_unit_page-label:

get_unit_page
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/get_unit_page.json

.. _dreq_get_ancestors-label:

get_ancestors
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/get_ancestors.json

.. _dreq_get_unit_content-label:

get_unit_content
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/get_unit_content.json

.. _dreq_get_unit_context-label:

get_unit_context
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/get_unit_context.json

.. _dreq_post-label:

post
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/post.json

.. _dreq_search-label:

search
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/search.json

.. _dreq_send_to_doc-label:

send_to_doc
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/send_to_doc.json

.. _dreq_move_cursor-label:

move_cursor
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/move_cursor.json

.. _dreq_hide_unit-label:

hide_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/hide_unit.json

.. _dreq_unhide_unit-label:

unhide_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/unhide_unit.json

.. _dreq_add_unit-label:

add_unit
=====================================

* **pith** - Pith of the new Unit.
* **parent** - Parent ID of the new Unit.
* **previous** - Previous Unit ID relative to Unit. If this Unit is meant to be first, set to parent.
* **position** - Absolute position

.. jsonschema:: ../../backend/src/schema/discussion/requests/add_unit.json

.. _dreq_select_unit-label:

select_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/select_unit.json

.. _dreq_move_units-label:

move_units
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/move_units.json

.. _dreq_merge_units-label:

merge_units
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/merge_units.json

.. _dreq_request_to_edit-label:

request_to_edit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/request_to_edit.json

.. _dreq_edit_unit-label:

edit_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/edit_unit.json

*************************************
Discussion Responses
*************************************

.. _dres_create_user-label:

create_user
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/create_user.json

.. _dres_join-label:

join
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/join.json

.. _dres_leave-label:

leave
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/leave.json

.. _dres_load_user-label:

load_user
=====================================

- **cursors** - Map of active user IDs to cursor positions. 
- **current_unit** - ID of the unit the user was last looking at.
- **timeline** - List of the units visited via the cursor.
- **chat_history** - List of the unit IDs.
- **chat_map** - Array of units in the chat history as well as their forward links.

.. jsonschema:: ../../backend/src/schema/discussion/responses/load_user.json

.. _dres_get_unit_page-label:

get_unit_page
=====================================

- **pith** - Pith of the unit.
- **ancestors** - Ancestors of the unit, including self.
- **children** - List of tuples, where each tuple has a children unit ID and the list of children for that unit.
- **backlinks** - List of tuples, where each tuple has a backlink unit ID and the list of backlinks for that unit.

.. jsonschema:: ../../backend/src/schema/discussion/responses/get_unit_page.json

.. _dres_get_ancestors-label:

get_ancestors
=====================================

- **ancestors** - List of ancestor unit IDs, from most recent to oldest.

.. jsonschema:: ../../backend/src/schema/discussion/responses/get_ancestors.json

.. _dres_get_unit_content-label:

get_unit_content
=====================================

- **pith** - Pith of the unit.
- **hidden** - Whether the unit is hidden, default false. 

.. jsonschema:: ../../backend/src/schema/discussion/responses/get_unit_content.json

.. _dres_get_unit_context-label:

get_unit_context
=====================================

- **pith** - Pith of the unit.
- **children** - List of children unit IDs. 

.. jsonschema:: ../../backend/src/schema/discussion/responses/get_unit_context.json

.. _dres_post-label:

post
=====================================

- **created_at** - Creation time of unit. 
- **author** - Nickname of the author. 
- **unit_id** - ID of the unit.
- **pith** - Pith of the unit. 

.. jsonschema:: ../../backend/src/schema/discussion/responses/post.json

.. _dres_search-label:

search
=====================================

- **units** - List of unit IDs, sorted in order of relevance.

.. jsonschema:: ../../backend/src/schema/discussion/responses/search.json

.. _dres_move_cursor-label:

move_cursor
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/move_cursor.json

.. _dres_hide_unit-label:

hide_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/hide_unit.json

.. _dres_unhide_unit-label:

unhide_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/unhide_unit.json

.. _dres_added_unit-label:

added_unit
=====================================

- **unit_id** - Unit ID.
- **pith** - Pith of the unit.
- **created_at** - Creation time of unit. 
- **parent** - Parent unit ID unit was added to.
- **position** - Index of unit in parent.

.. jsonschema:: ../../backend/src/schema/discussion/responses/added_unit.json

.. _dres_locked_unit_position-label:

locked_unit_position
=====================================

- **unit_id** - Unit ID.
- **nickname** - Nickname of user with unit's position lock.

.. jsonschema:: ../../backend/src/schema/discussion/responses/locked_unit_position.json

.. _dres_repositioned_unit-label:

repositioned_unit
=====================================

- **unit_id** - Unit ID.
- **parent** - Parent unit ID.
- **position** - Position of unit in parent unit.
- **old_parent** - Old parent unit ID.
- **old_position** - Position of unit in old parent unit.

.. jsonschema:: ../../backend/src/schema/discussion/responses/repositioned_unit.json

.. _dres_locked_unit_editable-label:

locked_unit_editable
=====================================

- **unit_id** - Unit ID.
- **nickname** - Nickname of user holding the edit lock.

.. jsonschema:: ../../backend/src/schema/discussion/responses/locked_unit_editable.json

.. _dres_edited_unit-label:

edited_unit
=====================================

- **unit_id** - Unit ID.
- **pith** - Pith of the unit.

.. jsonschema:: ../../backend/src/schema/discussion/responses/edited_unit.json

.. _dres_removed_backlinks-label:

removed_backlinks
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/removed_backlinks.json

.. _dres_added_backlinks-label:

added_backlinks
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/added_backlinks.json

