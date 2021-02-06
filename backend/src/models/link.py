"""
Link document.
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


class Link(Document):
    """
    Link representation.
    """

    meta = {'collection': 'links'}

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

    source = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """

    target = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """
