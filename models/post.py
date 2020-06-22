from collections import defaultdict
from datetime import datetime
import uuid

# using ISO so this can be easily parsed in js with Date()
date_time_fmt = "%Y-%m-%dT%H:%M:%SZ" 


class Post():
    def __init__(self, user, discussion, **entries):
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
        if "blocks" in entries:
            self.blocks = entries["blocks"]
        else:
            self.blocks = None # to be set
        if "freq_dict" in entries:
            self.freq_dict = defaultdict(lambda:0, entries["freq_dict"])
        else:
            self.freq_dict = None # to be set 
        if "tags" in entries:
            self.tags = entries["tags"]
        else:
            self.tags = []
        if "created_at" in entries:
            self.created_at = entries["created_at"]
        else:
            self.created_at = datetime.utcnow().strftime(date_time_fmt)
            # convert back: datetime.strptime(self.created_at, date_time_fmt)
