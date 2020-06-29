from collections import defaultdict
from datetime import datetime
import uuid

from database import posts

# using ISO so this can be easily parsed in js with Date()
date_time_fmt = "%Y-%m-%dT%H:%M:%SZ" 


class Post():
    def __init__(self, user, discussion, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.user = user
            self.discussion = discussion
            self.blocks = None
            self.freq_dict = None
            self.tags = []
            self.created_at = datetime.utcnow().strftime(date_time_fmt)
            # convert back: datetime.strptime(self.created_at, date_time_fmt)
