from collections import Counter
from nltk.stem import PorterStemmer
import string
import uuid

import utils


class Block():
    def __init__(self, user, post, body, **entries):
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
        self.freq_dict = utils.make_freq_dict(body) 
