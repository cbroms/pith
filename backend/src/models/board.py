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
import utils


class Board(Document):
    """
    Board representation.
    """

    meta = {'collection': 'board'}

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

    units = ListField(StringField(), default=[]) # unit ids
    """
    :type: *List[str]*
    :required: False
    :default: []
    """
