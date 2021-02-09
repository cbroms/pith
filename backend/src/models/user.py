"""
User document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  DateTimeField,
  StringField,
)
from utils import utils


class User(Document):
    """
    User representation.
    """

    meta = {'collection': 'users'}

    id = StringField(default=utils.gen_key(), primary_key=True)

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

    discussion_id = StringField()
    """
    :type: *str*
    :required: False
    :default: None
    """

    nickname = StringField(required=True)
    """
    :type: *str*
    :required: True
    :default: None
    """

    unit_update_cursor = DateTimeField(default=utils.get_time())
    """
    :type: *datetime*
    :required: False
    :default: Automatically generated.
    """
