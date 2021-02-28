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

    id = StringField(default=lambda: utils.gen_key(), primary_key=True)
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
