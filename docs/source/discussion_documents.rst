#####################################
Pith Discussion Documents
#####################################

*************************************
Unit
*************************************

.. autoclass:: models.discussion.Unit
    :show-inheritance:

    .. autoattribute:: id
      :annotation: = ID of Unit.
    .. autoattribute:: pith
      :annotation: = Pith.
    .. autoattribute:: discussion
      :annotation: = Source Discussion ID.
    .. autoattribute:: children
      :annotation: = Children Units.
    .. autoattribute:: forward_links
      :annotation: = Units current Unit refers to in the pith.
    .. autoattribute:: backward_links
      :annotation: = Units that refer to current Unit in their piths.
    .. autoattribute:: author
      :annotation: = Who first created the unit.
    .. autoattribute:: created_at
      :annotation: = When this Unit was created.
    .. autoattribute:: parent
      :annotation: = Parent Unit.
    .. autoattribute:: in_chat
      :annotation: = Whether this Unit is in the chat (true) or in the document (false).
    .. autoattribute:: source_unit_id
      :annotation: = Which chat Unit this Unit was copied from. 
    .. autoattribute:: original_pith
      :annotation: = Original pith of Unit, useful if pith was changed.
    .. autoattribute:: edit_count
      :annotation: = Number of times Unit was changed.
    .. autoattribute:: hidden 
      :annotation: = Whether the Unit is hidden or not.
    .. autoattribute:: edit_privilege 
      :annotation: = Who, if anyone, has privilege to edit the content.
    .. autoattribute:: position_privilege 
      :annotation: = Who, if anyone, has privilege to change the position.

*************************************
Cursor
*************************************

.. autoclass:: models.discussion.Cursor
    :show-inheritance:

    .. autoattribute:: unit_id
      :annotation: = ID of Unit Cursor is in.
    .. autoattribute:: position
      :annotation: = Index of Cursor among Unit's N children. Index i for i in 0..N-1 indicates the Cursor is before child i, index N indicates the Cursor is at end, and index -1 indicates the Cursor is streaming at the end.

*************************************
TimeInterval
*************************************

.. autoclass:: models.discussion.TimeInterval
    :show-inheritance:

    .. autoattribute:: unit_id
      :annotation: = ID of visited Unit.
    .. autoattribute:: start_time
      :annotation: = Time Cursor entered Unit.
    .. autoattribute:: end_time
      :annotation: = Time Cursor exited Unit.

*************************************
User
*************************************

.. autoclass:: models.discussion.User
    :show-inheritance:

    .. autoattribute:: id
      :annotation: = ID of User.
    .. autoattribute:: viewed_unit
      :annotation: = ID of Unit the User was last viewing.
    .. autoattribute:: start_time
      :annotation: = Time visit current unit.
    .. autoattribute:: name
      :annotation: = Entered and saved nickname.
    .. autoattribute:: cursor
      :annotation: = Cursor position.
    .. autoattribute:: active
      :annotation: = Whether User is in the Discussion.
    .. autoattribute:: timeline
      :annotation: = User's Cursor history.

*************************************
Discussion
*************************************

.. autoclass:: models.discussion.Discussion
    :show-inheritance:

    .. autoattribute:: id
      :annotation: = ID of Discussion.
    .. autoattribute:: document
      :annotation: = ID of Unit which serves as the root of the document.
    .. autoattribute:: chat
      :annotation: = List of Unit IDs in chat.
    .. autoattribute:: users
      :annotation: = List of User EmbeddedDocuments.
