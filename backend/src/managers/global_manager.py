import asyncio
from aiohttp import web
from arq import create_pool
from pymongo import MongoClient, ASCENDING
import mongoengine
import socketio

import constants
from utils import utils

from models.unit import Unit
from models.transclusion import Transclusion

from managers.board_manager import BoardManager
from managers.discussion_manager import DiscussionManager


class GlobalManager:

    def __init__(self):
        mgr = socketio.AsyncRedisManager(constants.SOCKET_REDIS)
        # need this to define app
        self.sio = socketio.AsyncServer(
            async_mode='aiohttp',
            client_manager=mgr,
            cors_allowed_origins="*"
        )
        self.aio_app = web.Application()
        self.sio.attach(self.aio_app)

    def start(self):

        # mongo
        self.client = MongoClient(constants.MONGODB_CONN)
        mongoengine.connect(constants.MONGODB_NAME, host=constants.MONGODB_CONN)
        self.db = self.client["pith"]

        # collections
        self.boards = self.db["boards"]
        self.discussions = self.db["discussions"]
        self.users = self.db["users"]
        self.units = self.db["units"]
        self.links = self.db["links"]
        self.transclusions = self.db["transclusions"]
        self.unit_updates = self.db["unit_updates"]

        # set up index for search
        self.units.create_index([("pith", ASCENDING)])

        # redis
        loop = asyncio.get_event_loop()
        self.redis_queue = loop.run_until_complete(create_pool(constants.ARQ_REDIS))

        # these get all the other variables
        self.discussion_manager = DiscussionManager(self)
        self.board_manager = BoardManager(self)


    def _get_transclusion_map(self, board_id, unit_id):
      transclusions = self.transclusions.find(
        {}, {"source": unit_id, "board_id": board_id}
      )
      target_ids = [t["target"] for t in transclusions]
      if len(target_ids) > 0:
        targets = self.units.find({}, {"_id": {"$in": target_ids}})
        map_id_pith = {t["_id"]:t["pith"] for t in targets}
      else:
        map_id_pith = {}
      return map_id_pith

    def _get_links_to(self, board_id, unit_id):
      links = self.links.find(
        {}, {"target": unit_id, "board_id": board_id}
      )
      link_list = [{
        "id": l["_id"],
        "source": l["source"],
        "target": l["target"],
      } for l in links]
      return link_list

    def _get_links_from(self, board_id, unit_id):
      links = self.links.find(
        {}, {"source": unit_id, "board_id": board_id}
      )
      link_list = [{
        "id": l["_id"],
        "source": l["source"],
        "target": l["target"],
      } for l in links]
      return link_list

    def _get_disc(self, board_id, discussion_id):
      discussion = self.discussions.find_one({"_id": discussion_id, "board_id": board_id})
      return {
        "id": discussion_id,
        "created": str(discussion["created"])
      }

    def _get_discussions(self, board_id, unit_id):
      # focused includes unit
      discussions = self.discussions.find(
        {}, {"focused": unit_id, "board_id": board_id}
      )
      try:
        utils.logger.info("D: {}".format([d for d in discussions]))
        discussions_list = [{ \
          "id": d["_id"], \
          "created": str(d["created"]) \
        } for d in discussions]
      except Exception as e:
        utils.logger.info(e)
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
        transclusions_list.append(
          Transclusion(board_id=board_id, source=unit_id, target=t).to_mongo()
        )
      # TODO may result in duplicate error
      if len(transclusions_list) > 0:
        self.transclusions.insert_many(transclusions_list)

    def _remove_transclusions(self, board_id, unit_id):
      self.transclusions.remove({"source": unit_id, "board_id": board_id})

    def _remove_links(self, board_id, unit_id):
      self.links \
        .remove({"source": unit_id, "board_id": board_id}) \
        .remove({"target": unit_id, "board_id": board_id})

    def _get_user(self, board_id, user_id):
      user = self.users.find_one({"_id": user_id, "board_id": board_id})
      return {
        "id": user_id,
        "nickname": user["nickname"]
      }

    def _get_link(self, board_id, link_id):
      link = self.links.find_one({"_id": link_id, "board_id": board_id})
      return {
        "id": link_id,
        "source": link["source"],
        "target": link["target"],
      }

    def _get_chat_unit(self, board_id, unit_id):
      unit = self.units.find_one({"_id": unit_id, "board_id": board_id})
      user = self.users.find_one({"_id": unit["author"], "board_id": board_id})
      return {
        "id": unit_id,
        "pith": unit["pith"],
        "created": str(unit["created"]), # TODO
        "author_id": user["_id"],
        "author_name": user["nickname"],
        "transclusions": self._get_transclusion_map(board_id, unit_id)
      }      

    def _get_basic_unit(self, board_id, unit_id):
      unit = self.units.find_one({"_id": unit_id, "board_id": board_id})
      return {
        "id": unit_id,
        "pith": unit["pith"],
        "transclusions": self._get_transclusion_map(board_id, unit_id)
      }      

    def _get_extended_unit(self, board_id, unit_id):
      unit = self.units.find_one({"_id": unit_id, "board_id": board_id})
      return {
        "id": unit_id,
        "pith": unit["pith"],
        "transclusions": self._get_transclusion_map(board_id, unit_id),
        "links_to": self._get_links_to(board_id, unit_id),
        "links_from": self._get_links_from(board_id, unit_id),
        "discussions": self._get_discussions(board_id, unit_id)
      }

    def _get_participants(self, board_id, discussion_id):
      participants = self.users.find(
        {}, {"discussion_id": discussion_id, "board_id": board_id}
      )
      return [self._get_user(p) for p in participants]
