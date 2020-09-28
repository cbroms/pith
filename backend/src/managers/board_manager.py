import datetime
import logging
from typing import (
  Any,
  Dict,
  List,
  Optional,
  Tuple,
)

import constants
import error
from search.search import search
from utils import utils

from models.discussion import (
  Unit,
  User,
  Discussion,
)


class BoardManager:

    def __init__(self, gm):
        self.gm = gm
        self.redis_queue = self.gm.redis_queue

    def create(self):
        unit = Unit("")
        unit.save()
        discussion = Discussion(document=unit.id)
        discussion.save()
        response = {"discussion_id": discussion.id}
        return response
