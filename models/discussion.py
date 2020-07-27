"""
Discussion struct.
"""
from datetime import datetime, timedelta
import uuid

from constants import DATE_TIME_FMT
from utils import utils


class Discussion():
    def __init__(self, title, theme, time_limit, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.title = title
            self.theme = theme
            self.time_limit = time_limit
            self.created_at = datetime.utcnow().strftime(DATE_TIME_FMT)
            self.expire_at = None
            self.expired = None
            if self.time_limit is not None:
                self.expired = False
                self.expire_at = datetime.utcnow() + timedelta(
                    seconds=self.time_limit
                )

            self.users = {}  # user ids with dict with name as value
            """
            The discussion stores the objects pertaining to it by id.
            """
            self.history = {}  # stores all posts
            self.history_blocks = {}  # stores all blocks
            self.internal_tags = {}  # tags for internal posts/blocks
