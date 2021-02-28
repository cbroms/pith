"""
Unit-update document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  StringField,
)
from utils import utils


class UnitUpdate(Document):
    """
    Unit-update representation.
    """

    meta = {'collection': 'unit_updates'}

    short_id = StringField(default=lambda: utils.gen_key())
    """
    :type: *str*
    :required: False
    :default: Automatically generated.
    """

    created = StringField(default=lambda: utils.get_time())
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
	
    unit_id = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """

    id = StringField(default="", primary_key=True)
