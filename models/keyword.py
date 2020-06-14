import uuid

import utils


class Keyword():
    def __init__(self, _id, **entries):
        self._id = _id
        self.blocks = {} # id : {"freq" : freq}
        self.posts = {} # id : {"freq" : freq}
