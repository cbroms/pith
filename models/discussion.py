import uuid

import utils


class Discussion():
    def __init__(self, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.tags = []
            self.users = []
            self.history = []
            self.history_blocks = []
