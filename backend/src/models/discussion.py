"""
Discussion document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  ListField,
  StringField,
)
from utils import utils


class Discussion(Document):
    """
    Discussion representation.
    """

    meta = {'collection': 'discussions'}

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

    board_id = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """

    chat = ListField(StringField(), default=[]) # unit ids
    """
    :type: *List[str]*
    :required: False
    :default: []
    """

    pinned = ListField(StringField(), default=[]) # unit ids
    """
    :type: *List[str]*
    :required: False
    :default: []
    """

    focused = ListField(StringField(), default=[]) # unit ids
    """
    :type: *List[str]*
    :required: False
    :default: []
    """
