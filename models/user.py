"""
User document.
"""
from mongoengine import (
  Document,
  EmbeddedDocument,
)
from mongoengine.fields import (
  BooleanField,
  DictField,
  EmbeddedDocumentListField,
  ListField,
  StringField,
)


# needs to be deleted when discussion is deleted
class DiscussionState(EmbeddedDocument):
  discussion_id = StringField(required=True, primary_key=True)
  name = StringField(required=True)
  active = BooleanField(default=True)
  library_posts = ListField(StringField())
  library_blocks = ListField(StringField())
  

class User(Document):
    meta = {'collection': 'users'}

    #_id = StringField(default=lambda: uuid.uuid4().hex, primary_key=True)
    ip = StringField(required=True, primary_key=True)
  
    """
    Fields for personal page.
    """

    """
    Discussion state.
    """

    discussions = EmbeddedDocumentListField(DiscussionState)
