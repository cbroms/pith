"""
Discussion struct.
"""
import uuid

from database import discussions
from search.basic_search import basic_search
from utils import utils


class Discussion():
    def __init__(self, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.users = [] # user ids
            """
            The discussion stores the objects pertaining to it by id.
            """
            self.history = {} # stores all posts
            self.history_blocks = {} # stores all blocks
            self.internal_tags = {} # tags for internal posts/blocks
