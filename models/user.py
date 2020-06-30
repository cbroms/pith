"""
User struct.
"""
from search.basic_search import basic_search
from database import users


class User():
    def __init__(self, _id, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = _id
            """
            A dict where keys are discussion ids and values are 
            X history (don't need this)
            - active # if in the discussion at the moment
            - library 
              - posts # saved post ids
              - blocks # saved block ids
            """
            self.discussions = {}
