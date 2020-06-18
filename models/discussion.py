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
        if "users" in entries:
            self.users = entries["users"]
        else:
            self.users = []
        if "history" in entries:
            self.history = entries["history"]
        else:
            self.history = []
        if "history_blocks" in entries:
            self.history_blocks = entries["history_blocks"]
        else:
            self.history_blocks = []
