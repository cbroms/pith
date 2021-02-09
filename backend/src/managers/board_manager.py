from utils import utils

from models.discussion import Discussion
from models.user import User
from models.unit import Unit
from models.link import Link
from models.unit_update import UnitUpdate

from managers.checker import Checker

class BoardManager:

    def __init__(self, gm):
        self.gm = gm

    def _record_unit_update(func):
      def helper(self, **kwargs):
        board_id = kwargs["board_id"]
        for p in Checker.unit_input:
          unit_id = kwargs[p]
          unit_update = UnitUpdate(board_id=board_id, unit_id=unit_id)
          self.gm.unit_updates.insert_one(unit_update)
      return helper

    @Checker._check_board_id
    def join_board(self, board_id):
      return {"board_id": board_id}

    @Checker._check_board_id
    @Checker._check_user_id
    def create_user(self, board_id, nickname):
      user = User(board_id=board_id, nickname=nickname)
      self.gm.users.insert_one(user)
      return {"board_id": board_id, "user_id": user._id}

    @Checker._check_board_id
    @Checker._check_user_id
    def load_board(self, board_id, user_id):
      self.gm.users.update_one(
        {"_id" : user_id, "board_id": board_id},
        {"$set": {"user_update_cursor": utils.get_time()}}
      )
      user = self.gm.users.find_one({"_id": user_id, "board_id": board_id})

      unit_ids = self.gm.boards.find_one({"_id": board_id})["units"]
      units_output = [self.gm._get_basic_units(board_id, unit_id) \
        for unit_id in unit_ids]

      return {"nickname": user["nickname"], "units": units_output}
        
    @Checker._check_board_id
    @Checker._check_user_id
    def update_board(self, board_id, user_id):
      user = self.gm.users.find_one({"_id": user_id, "board_id": board_id})
      unit_update_cursor = user["unit_update_cursor"]
      # update cursor before query for new results as overlap is better than break
      self.gm.users.update_one(
        {"_id" : user_id, "board_id": board_id},
        {"$set": {"user_update_cursor": utils.get_time()}}
      )
      unit_updates = self.gm.unit_updates.find({}, 
        {"created": {"$gt": unit_update_cursor}, "board_id": board_id}
      )
      unit_ids = [u["unit_id"] for u in unit_updates]
      updated_units = []
      for unit_id in unit_ids:
        if self.gm.units.find_one({"_id" : unit_id, "board_id": board_id}):
          updated_units.append(self.gm._get_extended_unit(board_id, unit_id))
      return {
        "updated_unit_ids": unit_ids, # deleted, added, edited
        "updated_units": updated_units # only added, edited
      }

    @Checker._check_board_id
    @_record_unit_update
    def add_unit(self, board_id, text):
      pith, transclusions = self.gm._get_pith(board_id, text)
      unit = Unit(board_id=board_id, pith=pith)
      self.gm.units.insert_one(unit)
      unit_id = unit["_id"]
      self.gm._insert_transclusions(board_id, unit_id, transclusions)
      return self.gm._get_basic_unit(board_id, unit_id)

    @Checker._check_board_id
    @Checker._check_unit_id
    @_record_unit_update
    def remove_unit(self, board_id, unit_id):
      self.gm.units.remove({"_id": unit_id, "board_id": board_id})
      self.gm._remove_transclusions(board_id, unit_id)
      # TODO remove transclusions where unit_id is target
      # TODO also want to remove unit_id from piths
      self.gm._remove_links(board_id, unit_id)
      return {"unit_id": unit_id}

    @Checker._check_board_id
    @Checker._check_unit_id
    @_record_unit_update
    def edit_unit(self, board_id, unit_id, text):
      unit = self.gm.units.find_one({"_id": unit_id, "board_id": board_id})
      pith, transclusions = self.gm._get_pith(board_id, text)
      self.gm.units.update_one(
        {"_id" : unit_id, "board_id": board_id},
        {"$set": {"pith": pith}}
      )
      unit_id = unit["_id"]
      self.gm._remove_transclusions(board_id, unit_id)
      self.gm._insert_transclusions(board_id, unit_id, transclusions)
      return self.gm._get_extended_unit(board_id, unit_id)

    @Checker._check_board_id
    @Checker._check_unit_id
    @_record_unit_update
    def add_link(self, board_id, source, target):
      link = Link(board_id=board_id, source=source, target=target)
      self.gm.links.insert_one(link)

    @Checker._check_board_id
    @Checker._check_link_id
    @_record_unit_update
    def remove_link(self, board_id, link_id):
      self.gm.links.remove({"_id": link_id, "board_id": board_id})

    @Checker._check_board_id
    @Checker._check_unit_id
    def get_unit(self, board_id, unit_id):
      return self.gm._get_extended_unit(board_id, unit_id)

    @Checker._check_board_id
    @Checker._check_unit_id
    @_record_unit_update
    def create_disc(self, board_id, unit_id):
      discussion = Discussion(board_id=board_id, focused=[unit_id])
      self.gm.discussions.insert_one(discussion)
      return {"discussion_id": discussion["_id"]}