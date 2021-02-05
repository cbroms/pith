import logging

import constants
from utils import utils

from models.unit import Unit
from models.discussion import Discussion


class BoardManager:

    def __init__(self, gm):
        self.gm = gm

    def _get(self, discussion_id):
        return Discussion.objects.get(id=discussion_id)

    def join_board(self, ):

    def create_user(self, ):

    def load_board(self, ):

    def add_unit(self, ):

    def remove_unit(self, ):

    def edit_unit(self, ):

    def add_link(self, ):

    def remove_link(self, ):

    def get_unit(self, ):

    def create_disc(self, ):
        unit = Unit(pith="", parent="", discussion="")
        unit.original_text = unit.pith
        discussion = Discussion(document=unit.id)
        discussion_id = discussion.id
        unit.discussion = discussion_id
        unit.save()
        discussion.save()
        response = {"discussion_id": discussion_id}
        return response
