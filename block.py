import uuid


class Block():
    def __init__(self, user, post, body, **entries):
        if "_id" in entries:
            self._id = entries["_id"]
        else:
            self._id = uuid.uuid4().hex
        self.user = user
        self.post = post
        if "tags" in entries:
            self.tags = entries["tags"]
        else:
            self.tags = []
        self.body = body
