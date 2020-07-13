"""
A block only exists within the discussion scope.
"""
from datetime import datetime
import uuid

from constants import date_time_fmt
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
            self.tags = {} # tag ids, value stores user
            self.freq_dict = utils.make_freq_dict(self.body)
            self.created_at = datetime.utcnow().strftime(date_time_fmt)
            # convert back: datetime.strptime(self.created_at, date_time_fmt)
