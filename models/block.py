import uuid

import utils


class Block():
    def __init__(self, user, discussion, post, body, **entries):
        if "_id" in entries:
            self._id = entries["_id"]
        else:
            self._id = uuid.uuid4().hex
        if "tags" in entries:
            self.tags = entries["tags"]
        else:
            self.tags = []
        self.user = user
        self.post = post
        self.body = body
        self.discussion = discussion
        self.freq_dict = utils.make_freq_dict(body) 
