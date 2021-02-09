"""
Unit-update document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  DateTimeField,
  StringField,
)
from utils import utils


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
	
    unit_id = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """
