import uuid


class Post():
    def __init__(self, user, blocks=None, freq_dict=None, **entries):
        if "_id" in entries:
            self._id = entries["_id"]
        else:
            self._id = uuid.uuid4().hex
        if "tags" in entries:
            self.tags = entries["tags"]
        else:
            self.tags = []
        self.user = user
        self.blocks = blocks
        self.freq_dict = freq_dict
