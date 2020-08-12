"""
Discussion document.
"""
from mongoengine import Document
from mongoengine.fields import (
  BooleanField,
  DateTimeField,
  DictField,
  IntField,
  StringField,
)
from datetime import datetime, timedelta
import uuid

from constants import DATE_TIME_FMT
from utils import utils


class Discussion(Document):
    meta = {'collection': 'discussions'}

    _id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True) # unique=True)
    created_at = DateTimeField(default=datetime.utcnow().strftime(DATE_TIME_FMT))
    users = DictField()  # user ids with dict with name as value

    """
    Configuration fields.
    """
    title = StringField(null=True)
    theme = StringField(null=True)
    time_limit = IntField(null=True)
    expire_at = DateTimeField(null=True)
    block_char_limit = IntField(null=True) 
    summary_char_limit = IntField(null=True) 

    """
    State fields.
    """
    expired = BooleanField(default=False)
    summary_char_left = IntField(null=True) # depends on summary_char_limit

    """
    The discussion stores the objects pertaining to it by id.
    """
    history = DictField()  # stores all posts
    history_blocks = DictField()  # stores all blocks
    internal_tags = DictField()  # tags for internal posts/blocks
    summary_blocks = DictField() # store blocks in summary
