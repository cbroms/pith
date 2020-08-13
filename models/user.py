"""
User document.
"""
from mongoengine import Document
from mongoengine.fields import (
  DictField,
  StringField,
)


class User(Document):
    meta = {'collection': 'users'}

    _id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    """
    A dict where keys are discussion ids and values are 
    - active # if in the discussion at the moment
    - name
    - library 
      - posts # saved post ids
      - blocks # saved block ids
    """
    discussions = DictField()
