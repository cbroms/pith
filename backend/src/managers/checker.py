"""
For managers associated with global manager.
"""
from json import dumps

from error import Errors
from utils.utils import (
  make_error,
)


class Checker:

  unit_input = ["unit_id", "source", "target"]

  def _check_board_id(func):
    def helper(self, **kwargs):
      board_id = kwargs["board_id"]
      if self.gm.boards.find_one({"_id" : board_id}):
        return func(self, **kwargs)
      else:
        return make_error(Errors.DNE_BOARD, 
          error_meta={"board_id": board_id}
        )
    return helper

  def _check_discussion_id(func):
    def helper(self, **kwargs):
      board_id = kwargs["board_id"]
      discussion_id = kwargs["discussion_id"]
      if self.gm.discussions.find_one({"_id" : discussion_id, "board_id": board_id}):
        return func(self, **kwargs)
      else:
        return make_error(Errors.DNE_DISCUSSION, 
          error_meta={"discussion_id": discussion_id}
        )
    return helper

  def _check_user_id(func):
    def helper(self, **kwargs):
      board_id = kwargs["board_id"]
      user_id = kwargs["user_id"]
      if self.gm.users.find_one({"_id" : user_id, "board_id": board_id}):
        return func(self, **kwargs)
      else:
        return make_error(Errors.DNE_USER, 
          error_meta={"user_id": user_id}
        )
    return helper

  def _check_unit_id(func):
    def helper(self, **kwargs):
      board_id = kwargs["board_id"]
      for p in Checker.unit_input:
        if p in kwargs:
          unit_id = kwargs[p]
          if self.gm.units.find_one({"_id" : unit_id, "board_id": board_id}):
            return func(self, **kwargs)
          else:
            return make_error(Errors.DNE_UNIT, 
              error_meta={"unit_id": unit_id}
            )
    return helper

  def _check_link_id(func):
    def helper(self, **kwargs):
      board_id = kwargs["board_id"]
      link_id = kwargs["link_id"]
      if self.gm.links.find_one({"_id" : link_id, "board_id": board_id}):
        return func(self, **kwargs)
      else:
        return make_error(Errors.DNE_LINK, 
          error_meta={"link_id": link_id}
        )
    return helper

