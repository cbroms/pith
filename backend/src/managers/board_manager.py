from utils import utils
from json import dumps

from models.board import Board
from models.discussion import Discussion
from models.user import User
from models.unit import Unit
from models.link import Link
from models.unit_update import UnitUpdate

from managers.checker import Checker

class BoardManager:

    def __init__(self, gm):
        self.gm = gm

    def _record_unit_update(self, board_id, unit_id):
        """
        Should only be applied to board units.
        """
        unit_update = UnitUpdate(board_id=board_id, unit_id=unit_id)
        self.gm.unit_updates.insert_one(unit_update.to_mongo())

    def create(self):
        board = Board()
        self.gm.boards.insert_one(board.to_mongo())
        print(board.to_mongo())
        return {"board_id": board.id}

    @Checker._check_board_id
    def join_board(self, board_id):
      return {"board_id": board_id}

    @Checker._check_board_id
    def create_user(self, board_id, nickname):
      user = User(board_id=board_id, nickname=nickname)
      self.gm.users.insert_one(user.to_mongo())
      return {"board_id": board_id, "user_id": user.id}

    @Checker._check_board_id
    @Checker._check_user_id
    def load_board(self, board_id, user_id):
      self.gm.users.update_one(
        {"_id" : user_id, "board_id": board_id},
        {"$set": {"user_update_cursor": utils.get_time()}}
      )
      user = self.gm.users.find_one({"_id": user_id, "board_id": board_id})

      units = self.gm.units.find({"chat": False, "board_id": board_id})
      units_output = [self.gm._get_basic_unit(board_id, unit["_id"]) \
        for unit in units]

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
      unit_updates = self.gm.unit_updates.find( 
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
    def add_unit(self, board_id, text):
      pith, transclusions = self.gm._get_pith(board_id, text)
      unit = Unit(board_id=board_id, pith=pith)
      self.gm.units.insert_one(unit.to_mongo())
      unit_id = unit.id
      self.gm._insert_transclusions(board_id, unit_id, transclusions)
      self._record_unit_update(board_id, unit_id)
      return {"unit": self.gm._get_basic_unit(board_id, unit_id)}

    @Checker._check_board_id
    @Checker._check_unit_id
    def remove_unit(self, board_id, unit_id):
      self.gm.units.remove({"_id": unit_id, "board_id": board_id})
      self.gm._remove_transclusions(board_id, unit_id)
      # TODO remove transclusions where unit_id is target
      # TODO also want to remove unit_id from piths
      self.gm._remove_links(board_id, unit_id)
      self._record_unit_update(board_id, unit_id)
      return {"unit_id": unit_id}

    @Checker._check_board_id
    @Checker._check_unit_id
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
      self._record_unit_update(board_id, unit_id)
      return {"unit": self.gm._get_extended_unit(board_id, unit_id)}

    @Checker._check_board_id
    @Checker._check_unit_id
    def add_link(self, board_id, source, target):
      link = Link(board_id=board_id, source=source, target=target)
      self.gm.links.insert_one(link.to_mongo())
      self._record_unit_update(board_id, source)
      self._record_unit_update(board_id, target)
      return {"link": self.gm._get_link(board_id, link.id)}

    @Checker._check_board_id
    @Checker._check_link_id
    def remove_link(self, board_id, link_id):
      link = self.gm.links.find_one({"_id": link_id, "board_id": board_id})
      result = {"link": self.gm._get_link(board_id, link["_id"])}
      self.gm.links.remove({"_id": link_id, "board_id": board_id})
      self._record_unit_update(board_id, link["source"])
      self._record_unit_update(board_id, link["target"])
      return result

    @Checker._check_board_id
    @Checker._check_unit_id
    def get_unit(self, board_id, unit_id):
      return {"unit": self.gm._get_extended_unit(board_id, unit_id)}

    @Checker._check_board_id
    @Checker._check_unit_id
    def create_disc(self, board_id, unit_id):
      discussion = Discussion(board_id=board_id, focused=[unit_id])
      utils.logger.info("create_disc: {}".format(discussion.to_mongo()))
      self.gm.discussions.insert_one(discussion.to_mongo())
      self._record_unit_update(board_id, unit_id)
      return {"discussion": self.gm._get_disc(board_id, discussion.id)}
