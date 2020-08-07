"""
A post only exists within the discussion scope.
"""
from datetime import datetime
import uuid


from constants import DATE_TIME_FMT


class Post():
    def __init__(self, user, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.user = user
            self.blocks = None  # block ids
            self.freq_dict = None
            self.tags = {}  # tag ids, values store user
            self.created_at = datetime.utcnow().strftime(DATE_TIME_FMT)
            # convert back: datetime.strptime(self.created_at, date_time_fmt)
