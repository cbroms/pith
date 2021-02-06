import logging

import constants
from utils import utils

from models.discussion import Discussion
from models.user import User
from models.unit import Unit
from models.link import Link
from models.transclusion import Transclusion
from models.unit_update import UnitUpdate


class BoardManager:

    def __init__(self, gm):
        self.gm = gm
        self.unit_input = ["unit_id", "source", "target"]

    def _get(self, discussion_id):
        return Discussion.objects.get(id=discussion_id)

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
        for p in self.unit_input:
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

    def _record_unit_update(func):
      def helper(self, **kwargs):
        board_id = kwargs["board_id"]
        for p in self.unit_input:
          unit_id = kwargs[p]
          unit_update = UnitUpdate(board_id=board_id, unit_id=unit_id)
          self.gm.unit_updates.insert_one(unit_update)
      return helper

    def _get_transclusion_map(self, board_id, unit_id):
      transclusions = self.gm.transclusions.find(
        {}, {"source": unit_id, "board_id": board_id}
      )
      target_ids = [t["target"] for t in transclusions]
      targets = self.gm.units.find({}, {"_id": {"$in": target_ids}})
      map_id_pith = [t["_id"]:t["pith"] for t in targets]
      return map_id_pith

    def _get_links_to(self, board_id, unit_id):
      links = self.gm.links.find(
        {}, {"target": unit_id, "board_id": board_id}
      )
      link_list = [{
        "id": l["_id"],
        "source": l["source"],
        "target": l["target"],
      } for l in links]
      return link_list

    def _get_links_from(self, board_id, unit_id):
      links = self.gm.links.find(
        {}, {"source": unit_id, "board_id": board_id}
      )
      link_list = [{
        "id": l["_id"],
        "source": l["source"],
        "target": l["target"],
      } for l in links]
      return link_list

    def _get_discussions(self, board_id, unit_id):
      # focused includes unit
      discussions = self.gm.discussions.find(
        {}, {"focused": unit_id, "board_id": board_id}
      )
      discussions_list [d["_id"] for d in discussions]
      return discussions_list

    def _get_pith(self, board_id, text):
      transclusions = constants.LINK_PATTERN.findall(text)
      transclusions = [t for t in transclusions if t != ""] # non-empty
      transclusions = list(set(transclusions)) # unique
      # TODO check transclusions are valid?
      pith = text # TODO
      return pith, transclusions

    def _insert_transclusions(self, board_id, unit_id, transclusions):
      # should have unique transclusions
      transclusions_list = []
      for t in transclusions:
        transclusion_list.append(
          Transclusion(board_id=board_id, source=unit_id, target=t)
        )
      # TODO may result in duplicate error
      self.gm.transclusions.insertMany(transclusions_list)

    def _remove_transclusions(self, board_id, unit_id):
      self.gm.transclusions.remove({"source": unit_id, "board_id": board_id})

    def _remove_links(self, board_id, unit_id):
      self.gm.links
        .remove({"source": unit_id, "board_id": board_id})
        .remove({"target": unit_id, "board_id": board_id})

    def _get_basic_units(self, board_id, unit_ids):
      units = []
      for unit_id in unit_ids:
        units.append({
          "id": unit_id,
          "pith": self.gm.units.find_one({"_id": unit_id, "board_id"})["pith"],
          "transclusions": self._get_transclusion_map(board_id, unit_id)
        })        
      return units

    @_check_board_id
    def join_board(self, board_id):
      return {"board_id": board_id}

    @_check_board_id
    @_check_user_id
    def create_user(self, board_id, nickname):
      user = User(board_id=board_id, nickname=nickname)
      self.gm.users.insert_one(user)
      return {"board_id": board_id, "user_id": user._id}

    @_check_board_id
    @_check_user_id
    def load_board(self, board_id, user_id):
      self.gm.users.update_one(
        {"_id" : user_id, "board_id": board_id},
        {"$set": {"user_update_cursor": utils.get_time()}}
      )
      user = self.gm.users.find_one({"_id": user_id, "board_id": board_id})

      unit_ids = self.gm.boards.find_one({"_id": board_id})["units"]
      units_output = self._get_basic_units(board_id, unit_ids)

      return {"nickname": user["nickname"], "units": units_output}
        
    @_check_board_id
    @_check_user_id
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
      updated_units = self._get_basic_units(board_id, unit_ids)
      # TODO what about updating info for units that are expanded?
      return {"updated_units": updated_units}

    @_check_board_id
    @_record_unit_update
    def add_unit(self, board_id, text):
      pith, transclusions = self._get_pith(board_id, text)
      unit = Unit(board_id=board_id, pith=pith)
      self.gm.units.insert_one(unit)
      unit_id = unit["_id"]
      self._insert_transclusions(board_id, unit_id, transclusions)
      return {
          "id": unit_id,
          "pith": pith,
          "transclusions": self._get_transclusion_map(board_id, unit_id)
      }

    @_check_board_id
    @_check_unit_id
    @_record_unit_update
    def remove_unit(self, board_id, unit_id):
      self.gm.units.remove({"_id": unit_id, "board_id": board_id})
      self._remove_transclusions(board_id, unit_id)
      # TODO remove transclusions where unit_id is target
      # TODO also want to remove unit_id from piths
      self._remove_links(board_id, unit_id)
      return {"unit_id": unit_id}

    @_check_board_id
    @_check_unit_id
    @_record_unit_update
    def edit_unit(self, board_id, unit_id, text):
      unit = self.gm.units.find_one({"_id": unit_id, "board_id": board_id})
      pith, transclusions = self._get_pith(board_id, text)
      self.gm.units.update_one(
        {"_id" : unit_id, "board_id": board_id},
        {"$set": {"pith": pith}}
      )
      unit_id = unit["_id"]
      self._remove_transclusions(board_id, unit_id)
      self._insert_transclusions(board_id, unit_id, transclusions)
      return {
        "pith": pith,
        "transclusions": self._get_transclusion_map(board_id, unit_id)
      }

    @_check_board_id
    @_check_unit_id
    @_record_unit_update
    def add_link(self, board_id, source, target):
      Link(board_id=board_id, source=source, target=target)
      self.gm.transclusions.insertMany(transclusions_list)

    @_check_board_id
    @_check_link_id
    @_record_unit_update
    def remove_link(self, board_id, link_id):
      self.gm.links.remove({"_id": link_id, "board_id": board_id})

    @_check_board_id
    @_check_unit_id
    def get_unit(self, board_id, unit_id):
      unit = self.gm.units.find_one({"_id": unit_id, "board_id": board_id})
      return {
        "id": unit["_id"],
        "pith": unit["pith"],
        "transclusions": self._get_transclusion_map(board_id, unit_id),
        "links_to": self._get_links_to(board_id, unit_id),
        "links_from": self._get_links_from(board_id, unit_id),
        "discussions": self._get_discussions(board_id, units_id)
      }

    @_check_board_id
    @_check_unit_id
    @_record_unit_update
    def create_disc(self, board_id, unit_id):
      discussion = Discussion(board_id=board_id, focused=[unit_id])
      self.gm.discussions.insert_one(discussion)
      return {"discussion_id": discussion["_id"]}
