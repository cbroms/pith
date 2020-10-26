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

.. _dreq_load_unit_page-label:

load_unit_page
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/load_unit_page.json

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

* **previous** - Previous Unit ID relative to Unit. If this Unit is meant to be first, set to parent.
* **position** - Absolute position

.. jsonschema:: ../../backend/src/schema/discussion/requests/add_unit.json

.. _dreq_select_unit-label:

select_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/select_unit.json

.. _dreq_deselect_unit-label:

deselect_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/deselect_unit.json

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

.. _dreq_deedit_unit-label:

deedit_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/deedit_unit.json

.. _dreq_edit_unit-label:

edit_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/edit_unit.json

*************************************
Discussion Responses
*************************************

.. _dres_created_user-label:

created_user
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/created_user.json

.. _dres_joined_user-label:

joined_user
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/joined_user.json

.. _dres_left_user-label:

left_user
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/left_user.json

.. _dres_loaded_user-label:

loaded_user
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/loaded_user.json

.. _dres_loaded_unit_page-label:

loaded_unit_page
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/loaded_unit_page.json

.. _dres_get_ancestors-label:

get_ancestors
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/get_ancestors.json

.. _dres_get_unit_content-label:

get_unit_content
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/get_unit_content.json

.. _dres_get_unit_context-label:

get_unit_context
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/get_unit_context.json

.. _dres_created_post-label:

created_post
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/created_post.json

.. _dres_search-label:

search
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/search.json

.. _dres_moved_cursor-label:

moved_cursor
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/moved_cursor.json

.. _dres_hid_unit-label:

hid_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/hid_unit.json

.. _dres_unhid_unit-label:

unhid_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/unhid_unit.json

.. _dres_added_unit-label:

added_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/added_unit.json

.. _dres_locked_unit_position-label:

locked_unit_position
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/locked_unit_position.json

.. _dres_unlocked_unit_position-label:

unlocked_unit_position
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/unlocked_unit_position.json

.. _dres_repositioned_unit-label:

repositioned_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/repositioned_unit.json

.. _dres_locked_unit_editable-label:

locked_unit_editable
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/locked_unit_editable.json

.. _dres_unlocked_unit_editable-label:

unlocked_unit_editable
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/unlocked_unit_editable.json

.. _dres_edited_unit-label:

edited_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/edited_unit.json

.. _dres_removed_backlinks-label:

removed_backlinks
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/removed_backlinks.json

.. _dres_added_backlinks-label:

added_backlinks
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/added_backlinks.json

*************************************
Sub-schemas
*************************************

cursor
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/cursor.json#/cursor

chat_meta
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/chat_meta.json#/chat_meta

doc_meta
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/doc_meta.json#/doc_meta
