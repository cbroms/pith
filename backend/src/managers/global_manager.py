import asyncio
from aiohttp import web
from arq import create_pool
from pymongo import MongoClient
import mongoengine
import socketio

import constants
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

        # collections
        self.board = db["board"]
        self.discussions = db["discussions"]
        self.users = db["users"]
        self.units = db["units"]
        self.links = db["links"]
        self.transclusions = db["transclusions"]
        self.unit_updates = db["unit_updates"]

        # set up index for search
        Unit.create_index([('pith', 'text')])

        # redis
        loop = asyncio.get_event_loop()
        self.redis_queue = loop.run_until_complete(create_pool(constants.ARQ_REDIS))

        # these get all the other variables
        self.discussion_manager = DiscussionManager(self)
        self.board_manager = BoardManager(self)

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

    def _get_user(self, board_id, user_id):
      user = self.gm.users.find_one({"_id": user_id, "board_id": board_id})
      return {
        "id": user_id,
        "nickname": user["nickname"]
      }

    def _get_chat_unit(self, board_id, unit_id):
      return {
        "id": unit_id,
        "pith": self.gm.units.find_one({"_id": unit_id, "board_id"})["pith"],
        "created":
        "author_id":
        "author_name":
        "transclusions": self._get_transclusion_map(board_id, unit_id)
      }      

    def _get_basic_unit(self, board_id, unit_id):
      return {
        "id": unit_id,
        "pith": self.gm.units.find_one({"_id": unit_id, "board_id"})["pith"],
        "transclusions": self._get_transclusion_map(board_id, unit_id)
      }      

    def _get_extended_unit(self, board_id, unit_id):
      unit = self.gm.units.find_one({"_id": unit_id, "board_id"})
      return {
        "id": unit_id,
        "pith": unit["pith"],
        "transclusions": self._get_transclusion_map(board_id, unit_id),
        "links_to": self._get_links_to(board_id, unit_id),
        "links_from": self._get_links_from(board_id, unit_id),
        "discussions": self._get_discussions(board_id, unit_id)
      }

    def _get_participants(self, board_id, discussion_id):
      participants = self.gm.users.find(
        {}, {"discussion_id": discussion_id, "board_id": board_id}
      )
      return [self._get_user(p) for p in participants]
