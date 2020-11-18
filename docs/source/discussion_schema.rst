#####################################
Pith Discussion Schema 
#####################################

*************************************
Discussion Requests
*************************************

.. _dreq_test_connect-label:

test_connect
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/requests/test_connect.json

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
====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/created_post.json

.. _dres_search-label:

search
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/search.json

.. _dres_set_cursor-label:

set_cursor
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/set_cursor.json

added_unit
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/added_unit.json

chat_meta
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/chat_meta.json#/chat_meta

doc_meta
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/doc_meta.json#/doc_meta

cursor
=====================================

.. jsonschema:: ../../backend/src/schema/discussion/responses/cursor.json#/cursor
