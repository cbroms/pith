"""
Tranclusion document.
"""
from mongoengine import (
  Document,
)
from mongoengine.fields import (
  DateTimeField,
  StringField,
)
from utils import utils


class Transclusion(Document):
    """
    Transclusions representation.
    """

    meta = {'collection': 'transclusions'}

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

    source = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """

    target = StringField()
    """
    :type: *str*
    :required: True
    :default: None
    """

