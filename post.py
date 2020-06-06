import uuid


class Post():
    def __init__(self, user, blocks=None, **entries):
        if "_id" in entries:
            self._id = entries["_id"]
        else:
            self._id = uuid.uuid4()
        self.user = user
        if "tags" in entries:
            self.tags = entries["tags"]
        else:
            self.tags = []
        self.blocks = blocks
