"""
Unit document.
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
import utils


class Unit(Document):
    """
    Unit representation.
    Text-searchable over `pith`.
    """

    meta = {'collection': 'units'}

    id = StringField(default=utils.gen_key(), primary_key=True)
    """
    :type: *str*
    :required: False
    :default: Automatically generated.
    """

    created = DateTimeField(default=utils.get_time())
    """
    :type: *datetime*
    :required: False
    :default: Automatically generated.
    """

    board_id = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """

    pith = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None
    """

    chat = BooleanField(default=False) # versus in document
    """
    :type: *bool*
    :required: False
    :default: False
    """

    author = StringField()
    """
    :type: *str*
    :required: False
    :default: None
    """
