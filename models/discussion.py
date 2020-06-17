import uuid

import utils


class Discussion():
    def __init__(self, **entries):
        if "_id" in entries:
            self._id = entries["_id"]
        else:
            self._id = uuid.uuid4().hex
        if "tags" in entries:
            self.tags = entries["tags"]
        else:
            self.tags = []
        self.users = []
        self.history = []
