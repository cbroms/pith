"""
Unit document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  BooleanField,
  StringField,
)
from utils import utils

class Unit(Document):
    """
    Unit representation.
    Text-searchable over `pith`.
    """

    meta = {'collection': 'units'}

    short_id = StringField(default=lambda: utils.gen_key())
    """
    :type: *str*
    :required: False
    :default: Automatically generated.
    """

    created = StringField(default=lambda: utils.get_time())
    """
    :type: *str*
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

    hidden = BooleanField(default=False)
    """
    :type: *bool*
    :required: False
    :default: False
    """

    id = StringField(default="", primary_key=True)
