"""
Unit-update document.
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


class UnitUpdate(Document):
    """
    Unit-update representation.
    """

    meta = {'collection': 'unit_update'}

    id = StringField(default=utils.gen_key(), primary_key=True)
    """
    :type: *str*
    :required: False
    :default: Automatically generated.
    """

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
	
    unit = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """
