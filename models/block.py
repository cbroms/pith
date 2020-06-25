from collections import defaultdict
import uuid

import utils


class Block():
    def __init__(self, user, discussion, post, body, **entries):
        if "_id" in entries: # reload
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.user = user
            self.discussion = discussion
            self.post = post
            self.body = body
            self.tags = []
            self.freq_dict = utils.make_freq_dict(self.body)
        self.freq_dict = defaultdict(lambda:0, self.freq_dict) 
