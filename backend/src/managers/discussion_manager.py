from error import Errors
from utils.utils import (
  make_error,
)

from models.unit import Unit

from managers.checker import Checker


class DiscussionManager:

    def __init__(self, gm):
        self.gm = gm

    @Checker._check_board_id
    @Checker._check_discussion_id
    @Checker._check_user_id
    def join_disc(self, board_id, discussion_id, user_id):
      self.gm.users.update_one(
        {"_id" : user_id, "board_id": board_id},
        {"$set": {"discussion_id": discussion_id}}
      )
      return {"user": self.gm._get_user(board_id, user_id)}

    @Checker._check_board_id
    @Checker._check_discussion_id
    def load_disc(self, board_id, discussion_id):
      discussion = self.gm.discussions.find_one({"_id": discussion_id, "board_id": board_id})
      return {
        "chat": [self.gm._get_chat_unit(board_id, u) for u in discussion["chat"]],
        "pinned": [self.gm._get_chat_unit(board_id, u) for u in discussion["pinned"]],
        "focused": [self.gm._get_basic_unit(board_id, u) for u in discussion["focused"]],
        "participants": self.gm._get_participants(board_id, discussion_id)
      }

    @Checker._check_board_id
    @Checker._check_discussion_id
    @Checker._check_user_id
    def leave_disc(self, board_id, discussion_id, user_id):
      self.gm.users.update_one(
        {"_id" : user_id, "board_id": board_id},
        {"$set": {"discussion_id": None}}
      )
      return {"user": self.gm._get_user(board_id, user_id)}

    @Checker._check_board_id
    @Checker._check_discussion_id
    @Checker._check_user_id
    def post(self, board_id, discussion_id, user_id, text):
      pith, transclusions = self.gm._get_pith(board_id, text)
      unit = Unit(board_id=board_id, pith=pith, chat=True, author=user_id)
      self.gm.units.insert_one(unit.to_mongo())
      unit_id = unit.id
      self.gm._insert_transclusions(board_id, unit_id, transclusions)
      self.gm.discussions.update_one(
        {"_id" : discussion_id, "board_id": board_id},
        {"$push": {"chat": unit_id}}
      )
      return {"unit": self.gm._get_chat_unit(board_id, unit_id)}

    @Checker._check_board_id
    @Checker._check_discussion_id
    @Checker._check_unit_id
    def add_pinned(self, board_id, discussion_id, unit_id):
      unit = self.gm.units.find_one({"_id": unit_id, "board_id": board_id})
      if unit["chat"] is False:
        return make_error(Errors.NOT_CHAT, 
          error_meta={"unit_id": unit_id}
        )
      self.gm.discussions.update_one(
        {"_id" : discussion_id, "board_id": board_id},
        {"$addToSet": {"pinned": unit_id}}
      )
      return {"unit": self.gm._get_chat_unit(board_id, unit_id)}

    @Checker._check_board_id
    @Checker._check_discussion_id
    @Checker._check_unit_id
    def remove_pinned(self, board_id, discussion_id, unit_id):
      self.gm.discussions.update_one(
        {"_id" : discussion_id, "board_id": board_id},
        {"$pull": {"pinned": unit_id}}
      )
      return {"unit_id": unit_id}

    @Checker._check_board_id
    @Checker._check_discussion_id
    @Checker._check_unit_id
    def add_focused(self, board_id, discussion_id, unit_id):
      unit = self.gm.units.find_one({"_id": unit_id, "board_id": board_id})
      if unit["chat"] is True:
        return make_error(Errors.NOT_BOARD, 
          error_meta={"unit_id": unit_id}
        )
      self.gm.discussions.update_one(
        {"_id" : discussion_id, "board_id": board_id},
        {"$addToSet": {"focused": unit_id}}
      )
      return {"unit": self.gm._get_basic_unit(board_id, unit_id)}

    @Checker._check_board_id
    @Checker._check_discussion_id
    @Checker._check_unit_id
    def remove_focused(self, board_id, discussion_id, unit_id):
      self.gm.discussions.update_one(
        {"_id" : discussion_id, "board_id": board_id},
        {"$pull": {"focused": unit_id}}
      )
      return {"unit_id": unit_id}
