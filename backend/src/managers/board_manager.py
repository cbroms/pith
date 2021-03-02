from arq import create_pool
from arq.connections import RedisSettings
from json import dumps
from pymongo import ASCENDING

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
        self.cursor = None 

    def _record_unit_update(self, board_id, unit_id):
        """
        Should only be applied to board units.
        """
        unit_update = UnitUpdate(board_id=board_id, unit_id=unit_id)
        unit_update.id = "{}:{}".format(unit_update.board_id, unit_update.short_id)

        self.gm.unit_updates.insert_one(unit_update.to_mongo())

    @Checker._check_board_id
    def join_board(self, board_id):
      return {"board_id": board_id}

    @Checker._check_board_id
    def create_user(self, board_id, nickname):
      user = User(board_id=board_id, nickname=nickname)
      user.id = "{}:{}".format(user.board_id, user.short_id)

      self.gm.users.insert_one(user.to_mongo())
      return {"board_id": board_id, "user_id": user.short_id}

    @Checker._check_board_id
    @Checker._check_user_id
    def load_board(self, board_id, user_id):
      user = self.gm.users.find_one({"short_id": user_id, "board_id": board_id})

      units = self.gm.units.find({"chat": False, "board_id": board_id})
      units_output = [self.gm._get_basic_unit(board_id, unit["short_id"]) \
        for unit in units if unit["hidden"] is False]

      return {"nickname": user["nickname"], "units": units_output}

    @Checker._check_board_id
    def update_board(self, board_id, cursor):
      unit_updates = self.gm.unit_updates.find( 
        {"created": {"$gt": cursor}, "board_id": board_id}
      )
      unit_ids = [u["unit_id"] for u in unit_updates]

      # update timer
      self.cursor = utils.get_time()

      updated_units = []
      removed_ids = []
      for unit_id in unit_ids:
        unit = self.gm.units.find_one({"short_id" : unit_id, "board_id": board_id})
        if unit["hidden"] is False:
          updated_units.append(self.gm._get_extended_unit(board_id, unit_id))
        else:
          removed_ids.append(unit_id)

      return {
        "removed_ids": removed_ids, # deleted
        "updated_units": updated_units # added, edited
      }
        
    @Checker._check_board_id
    def add_unit(self, board_id, text):
      pith, transclusions = self.gm._get_pith(board_id, text)
      unit = Unit(board_id=board_id, pith=pith)
      unit.id = "{}:{}".format(unit.board_id, unit.short_id)

      self.gm.units.insert_one(unit.to_mongo())
      unit_id = unit.short_id
      self.gm._insert_transclusions(board_id, unit_id, transclusions)
      self._record_unit_update(board_id, unit_id)
      return {"unit": self.gm._get_basic_unit(board_id, unit_id)}

    @Checker._check_board_id
    @Checker._check_unit_id
    def remove_unit(self, board_id, unit_id):
      self.gm.units.update_one(
        {"short_id" : unit_id, "board_id": board_id},
        {"$set": {"hidden": True}}
      )

      #self.gm.units.remove({"short_id": unit_id, "board_id": board_id})
      #self.gm._remove_transclusions(board_id, unit_id)
      ## TODO remove transclusions where unit_id is target
      ## TODO also want to remove unit_id from piths
      #self.gm._remove_links(board_id, unit_id)
      self._record_unit_update(board_id, unit_id)
      return {"unit_id": unit_id}

    @Checker._check_board_id
    @Checker._check_unit_id
    def edit_unit(self, board_id, unit_id, text):
      unit = self.gm.units.find_one({"short_id": unit_id, "board_id": board_id})
      pith, transclusions = self.gm._get_pith(board_id, text)
      self.gm.units.update_one(
        {"short_id" : unit_id, "board_id": board_id},
        {"$set": {"pith": pith}}
      )
      unit_id = unit["short_id"]
      self.gm._remove_transclusions(board_id, unit_id)
      self.gm._insert_transclusions(board_id, unit_id, transclusions)
      self._record_unit_update(board_id, unit_id)
      return {"unit": self.gm._get_extended_unit(board_id, unit_id)}

    @Checker._check_board_id
    @Checker._check_unit_id
    def add_link(self, board_id, source, target):
      link = Link(board_id=board_id, source=source, target=target)
      link.id = "{}:{}".format(link.board_id, link.short_id)

      self.gm.links.insert_one(link.to_mongo())
      self._record_unit_update(board_id, source)
      self._record_unit_update(board_id, target)
      return {"link": self.gm._get_link(board_id, link.short_id)}

    @Checker._check_board_id
    @Checker._check_link_id
    def remove_link(self, board_id, link_id):
      link = self.gm.links.find_one({"short_id": link_id, "board_id": board_id})
      result = {"link": self.gm._get_link(board_id, link["short_id"])}
      self.gm.links.remove({"short_id": link_id, "board_id": board_id})
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
      discussion.id = "{}:{}".format(discussion.board_id, discussion.short_id)

      self.gm.discussions.insert_one(discussion.to_mongo())
      self._record_unit_update(board_id, unit_id)
      return {"discussion": self.gm._get_disc(board_id, discussion.short_id)}

    @Checker._check_board_id
    def search(self, board_id, query):
      # query is OR-based      
      results = [u["short_id"] for u in self.gm.units.find({
        "board_id": board_id,
        "chat": False,
        "$text": {"$search": query}
      }).sort([("created", ASCENDING)])]
      return {"results": [self.gm._get_extended_unit(board_id, r) for r in results]}
