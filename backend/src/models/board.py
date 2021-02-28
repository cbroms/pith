"""
Board document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  ListField,
  StringField,
)
from utils import utils


class Board(Document):
    """
    Board representation.
    """

    meta = {'collection': 'boards'}

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

    id = StringField(default="", primary_key=True)
