"""
Discussion document.
"""
from mongoengine import (
  Document,
  EmbeddedDocument,
  PULL,
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


class Tag(EmbeddedDocument):
    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    tag = StringField(required=True)
    owner = StringField(required=True)


class Block(EmbeddedDocument):
    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    body = StringField(required=True)
    user = StringField()
    post = StringField()
    tags = EmbeddedDocumentListField(Tag)
    created_at = DateTimeField(default=datetime.utcnow()) # .strftime(DATE_TIME_FMT)
    # convert back: datetime.strptime(created_at, DATE_TIME_FMT)
    freq_dict = DictField()


class Post(EmbeddedDocument):
    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    user = StringField()
    blocks = ListField(StringField())
    created_at = DateTimeField(default=datetime.utcnow()) # .strftime(DATE_TIME_FMT)
    # convert back: datetime.strptime(created_at, DATE_TIME_FMT)


class Discussion(Document):
    meta = {'collection': 'discussions'}

    id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    created_at = DateTimeField(default=datetime.utcnow().strftime(DATE_TIME_FMT))
    users = ListField(ReferenceField(User, reverse_delete_rule=PULL)) 

    """
    Configuration fields.
    """
    title = StringField() #null=True)
    theme = StringField() #null=True)
    time_limit = IntField() #null=True)
    expire_at = DateTimeField() #null=True)
    block_char_limit = IntField() #null=True) 
    summary_char_limit = IntField() #null=True) 

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
    summary_blocks = EmbeddedDocumentListField(Block) # store blocks in summary
