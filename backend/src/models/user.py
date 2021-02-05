"""
User document.
"""
from mongoengine import (
  Document,
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


class User(EmbeddedDocument):
    """
    User representation.
    """

    meta = {'collection': 'users'}

    id = StringField(default=utils.gen_key(), primary_key=True)

    created = DateTimeField(default=datetime.utcnow())
    """
    :type: *datetime*
    :required: False
    :default: Automatically generated.
    """

    board = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """

    discussion = StringField()
    """
    :type: *str*
    :required: False
    :default: None
    """

    nickname = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None
    """

    unit_update_cursor = DateTimeField(default=datetime.utcnow())
    """
    :type: *datetime*
    :required: False
    :default: Automatically generated.
    """



