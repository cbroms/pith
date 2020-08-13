"""
Discussion document.
"""
from mongoengine import (
  Document,
  EmbeddedDocument,
)
from mongoengine.fields import (
  BooleanField,
  DateTimeField,
  DictField,
  EmbeddedDocumentListField,
  IntField,
  ListField,
  ReferenceField,
  StringField,
)
from datetime import datetime, timedelta
import uuid

from constants import DATE_TIME_FMT
from models.user import User


class Block(EmbeddedDocument):
    _id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    body = StringField(required=True)
    user = StringField() # ReferenceField(User, reverse_delete_rule=mongoengine.PULL)
    post = ReferenceField('Post')
    tags = DictField()  # tag ids, value stores user
    created_at = DateTimeField(default=datetime.utcnow().strftime(DATE_TIME_FMT))
    # convert back: datetime.strptime(created_at, date_time_fmt)
    # freq_dict = utils.make_freq_dict(self.body)


class Post(EmbeddedDocument):
    _id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    user = StringField() # ReferenceField(User, reverse_delete_rule=mongoengine.PULL)
    blocks = ListField(ReferenceField('Block')) # may add option to delete
    tags = DictField()  # tag ids, values store user
    created_at = DateTimeField(default=datetime.utcnow().strftime(DATE_TIME_FMT))
    # convert back: datetime.strptime(created_at, date_time_fmt)
    # freq_dict = None


class Discussion(Document):
    meta = {'collection': 'discussions'}

    _id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    created_at = DateTimeField(default=datetime.utcnow().strftime(DATE_TIME_FMT))
    users = DictField() #ListField(ReferenceField(User, reverse_delete_rule=mongoengine.PULL)) 

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
    history = EmbeddedDocumentListField(Post)  # stores all posts, may add option to delete
    history_blocks = EmbeddedDocumentListField(Block)  # stores all blocks, may add option to delete
    internal_tags = DictField()  # tags for internal posts/blocks
    summary_blocks = EmbeddedDocumentListField(Block) # store blocks in summary
