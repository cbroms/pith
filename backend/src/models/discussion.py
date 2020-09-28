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
    children = ListField(StringField(), required=True, default=[])
    forward_links = ListField(StringField(), required=True, default=[])
    backward_links = ListField(StringField(), required=True, default=[])
    created_at = DateTimeField(required=True, default=datetime.utcnow())
    in_chat = BooleanField(required=True, default=False) # versus in document
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


class User(EmbeddedDocument):
    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    active = BooleanField(required=True, default=False)
    name = StringField(required=True)
    cursor = EmbeddedDocumentField(Cursor, required=True) 


class Discussion(Document):
    meta = {'collection': 'discussions'}

    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    document = StringField(required=True) # unit id
    chat = EmbeddedDocumentListField(Unit, default=[])
    users = EmbeddedDocumentListField(User, default=[]) 
