from collections import defaultdict
import uuid

import utils


class Block():
    def __init__(self, user, discussion, post, body, **entries):
        if "_id" in entries:
            self._id = entries["_id"]
        else:
            self._id = uuid.uuid4().hex
        if "user" in entries:
            self.user = entries["user"]
        else:
            self.user = user
        if "discussion" in entries:
            self.discussion = entries["discussion"]
        else:
            self.discussion = discussion
        if "post" in entries:
            self.post = entries["post"]
        else:
            self.post = post
        if "body" in entries:
            self.body = entries["body"]
        else:
            self.body = body
        assert(self.body is not None)
        if "freq_dict" in entries:
            self.freq_dict = entries["freq_dict"]
        else:
            self.freq_dict = utils.make_freq_dict(self.body)
        self.freq_dict = defaultdict(lambda:0, self.freq_dict) 
        if "tags" in entries:
            self.tags = entries["tags"]
        else:
            self.tags = []
