"""
A tag that only exists within the discussion scope.
"""
import uuid

import utils


class Tag():
    def __init__(self, tag, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = tag 
