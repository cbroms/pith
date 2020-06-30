"""
A block only exists within the discussion scope.
"""
from collections import defaultdict
import uuid

from database import blocks
from utils import utils


class Block():
    def __init__(self, user, post, body, **entries):
        if "_id" in entries: # reload
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.user = user
            self.post = post
            self.body = body
            self.tags = {} # block ids, value stores user
            self.freq_dict = utils.make_freq_dict(self.body)
        self.freq_dict = defaultdict(lambda:0, self.freq_dict) 
        self.created_at = datetime.utcnow().strftime(date_time_fmt)
        # convert back: datetime.strptime(self.created_at, date_time_fmt)
