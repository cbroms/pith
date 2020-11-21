import logging

import constants
from utils import utils

from models.discussion import (
  Unit,
  Discussion,
)


class BoardManager:

    def __init__(self, gm):
        self.gm = gm
        self.redis_queue = self.gm.redis_queue

    def _get(self, discussion_id):
        return Discussion.objects.get(id=discussion_id)

    def create(self):
        unit = Unit(pith="", parent="", discussion="")
        unit.original_text = unit.pith
        discussion = Discussion(document=unit.id)
        discussion_id = discussion.id
        unit.discussion = discussion_id
        unit.save()
        discussion.save()
        response = {"discussion_id": discussion_id}
        return response
