"""
Discussion document.
"""
from mongoengine import (
  Document,
  EmbeddedDocument,
  PULL,
)
from mongoengine.fields import (
  BooleanField,
  DateTimeField,
  DictField,
  EmbeddedDocumentField,
  EmbeddedDocumentListField,
  IntField,
  ListField,
  ReferenceField,
  StringField,
)
from datetime import datetime
import uuid


class Unit(Document):
    """
    Text-searchable over `pith`.
    """

    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    """
    :type: *str*
    :required: False
    :default: Automatically generated.
    """

    pith = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None
    """

    children = ListField(StringField(), default=[])
    """
    :type: *List[str]*
    :required: False
    :default: []
    """

    forward_links = ListField(StringField(), default=[])
    """
    :type: *List[str]*
    :required: False
    :default: []
    """

    backward_links = ListField(StringField(), default=[])
    """
    :type: *List[str]*
    :required: False
    :default: []
    """

    author = StringField()
    """
    :type: *str*
    :required: False
    :default: None
    """

    created_at = DateTimeField(default=datetime.utcnow())
    """
    :type: *datetime*
    :required: False
    :default: Automatically generated.
    """

    in_chat = BooleanField(default=False) # versus in document
    """
    :type: *bool*
    :required: False
    :default: False
    """

    parent = StringField(required=True) 
    """
    :type: *str*
    :required: True
    :default: None
    """

    position = IntField()
    """
    :type: *int*
    :required: False 
    :default: None
    """

    # if from chat
    source_unit_id = StringField()
    """
    :type: *str*
    :required: False
    :default: None
    """

    original_pith = StringField()
    """
    NOTE: Should be set to pith upon initialization.

    :type: *str*
    :required: False
    :default: None
    """

    # if from document
    edit_count = IntField(default=0)
    """
    :type: *int*
    :required: False
    :default: 0
    """

    hidden = BooleanField(default=False)
    """
    :type: *bool*
    :required: False
    :default: False
    """

    # content_lock
    edit_privilege = StringField(allow_null=True)
    """
    :type: *str*
    :requires: False
    :nullable: True
    """

    # position_lock
    position_privilege = StringField(allow_null=True)
    """
    :type: *str*
    :requires: False
    :nullable: True
    """

class Cursor(EmbeddedDocument):
    """
    Position of a user within a document for editing.
    """

    unit_id = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None
    """

    position = IntField(required=True)
    """
    :type: *int*
    :required: True
    :default: None
    """


class TimeInterval(EmbeddedDocument):
    """
    Time interval spent on some unit.
    """

    unit_id = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None
    """

    start_time = DateTimeField(required=True)
    """
    :type: *datetime*
    :required: True
    :default: None
    """

    end_time = DateTimeField(required=True)
    """
    :type: *datetime*
    :required: True
    :default: None
    """


class User(EmbeddedDocument):
    """
    User representation.
    """

    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)

    viewed_unit = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None
    """

    start_time = StringField(required=True)
    """
    :type: *datetime*
    :required: True
    :default: None
    """

    name = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None
    """

    cursor = EmbeddedDocumentField(Cursor, required=True) 
    """
    :type: *Cursor*
    :required: True
    :default: None
    """

    active = BooleanField(default=False)
    """
    :type: *bool*
    :required: False
    :default: False
    """

    timeline = EmbeddedDocumentListField(TimeInterval, default=[])
    """
    :type: *EmbeddedDocumentList[TimeInterval]*
    :required: False
    :default: []
    """


class Discussion(Document):
    """
    Discussion representation.
    """

    meta = {'collection': 'discussions'}

    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    """
    :type: *str*
    :required: False
    :default: Automatically generated.
    """
    
    document = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None 
    """

    chat = ListField(StringField(), default=[]) # unit ids
    """
    :type: *List[str]*
    :required: False
    :default: []
    """

    users = EmbeddedDocumentListField(User, default=[]) 
    """
    :type: *EmbeddedDocumentList[User]*
    :required: False
    :default: []
    """
