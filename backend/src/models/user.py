"""
User document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  StringField,
)
from utils import utils


class User(Document):
    """
    User representation.
    """

    meta = {'collection': 'users'}

    short_id = StringField(default=lambda: utils.gen_key())

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

    unit_update_cursor = StringField(default=lambda: utils.get_time())
    """
    :type: *str*
    :required: False
    :default: Automatically generated.
    """

    id = StringField(default="", primary_key=True)
