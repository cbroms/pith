"""
Board document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  DateTimeField,
  ListField,
  StringField,
)
from utils import utils


class Board(Document):
    """
    Board representation.
    """

    meta = {'collection': 'boards'}

    id = StringField(default=lambda: utils.gen_key(), primary_key=True)
    """
    :type: *str*
    :required: False
    :default: Automatically generated.
    """

    created = DateTimeField(default=lambda: utils.get_time())
    """
    :type: *datetime*
    :required: False
    :default: Automatically generated.
    """
