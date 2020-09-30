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
    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    pith = StringField(required=True)
    children = ListField(StringField(), default=[])
    forward_links = ListField(StringField(), default=[])
    backward_links = ListField(StringField(), default=[])
    created_at = DateTimeField(default=datetime.utcnow())
    in_chat = BooleanField(default=False) # versus in document
    parent = StringField() 
    # if from chat
    original_text = StringField()
    # if from document
    edit_count = IntField()
    hidden = BooleanField()
    # content_lock
    # position_lock
    freq_dict = DictField()


class Cursor(EmbeddedDocument):
    unit_id = StringField(required=True)
    position = IntField(null=True)


class TimeInterval(EmbeddedDocument):
    unit_id = StringField(required=True)
    start_time = DateTimeField(required=True)
    end_time = DateTimeField(required=True)


class User(EmbeddedDocument):
    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    viewed_unit = StringField(required=True)
    name = StringField(required=True)
    cursor = EmbeddedDocumentField(Cursor, required=True) 
    active = BooleanField(default=False)
    timeline = EmbeddedDocumentListField(TimeInterval, default=[])


class Discussion(Document):
    meta = {'collection': 'discussions'}

    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    document = StringField(required=True) # unit id
    chat = ListField(StringField(), default=[]) # unit ids
    users = EmbeddedDocumentListField(User, default=[]) 
