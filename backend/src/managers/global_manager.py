import asyncio
from aiohttp import web
from arq import create_pool
from json import dumps
from pymongo import MongoClient, TEXT
import mongoengine
import re
import socketio

import constants
from utils.utils import (
  get_time,
  logger,
  DictEncoder,
)

from models.unit import Unit
from models.board import Board
from models.transclusion import Transclusion

from managers.board_manager import BoardManager
from managers.discussion_manager import DiscussionManager


async def update_board_job(ctx):

  gm = ctx["manager"]
  cursor = ctx["cursor"]
  ctx["cursor"] = get_time()

  boards = [b for b in gm.boards.find()]

  for board in boards:
    board_id = board["short_id"]

    # use cursor to get update
    product = gm.board_manager.update_board(board_id=board_id, cursor=cursor)
    result = dumps(product, cls=DictEncoder)

    # emit to every user in board
    await gm.sio.emit(
      "update_board",
      result, 
      room=board_id,
      namespace='/board'
    )


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

    def start(self, start_redis=False):
        logger.info("Starting manager...")

        # mongo
        logger.info("Connecting to mongo at {}...".format(constants.MONGODB_CONN))
        self.client = MongoClient(constants.MONGODB_CONN)
        mongoengine.connect(constants.MONGODB_NAME, host=constants.MONGODB_CONN)
        self.db = self.client["pith"]

        # collections
        logger.info("Accessing collections...")
        self.boards = self.db["boards"]
        self.discussions = self.db["discussions"]
        self.users = self.db["users"]
        self.units = self.db["units"]
        self.links = self.db["links"]
        self.transclusions = self.db["transclusions"]
        self.unit_updates = self.db["unit_updates"]

        # set up index for search
        logger.info("Creating index...")
        self.units.create_index([("pith", TEXT), ("author_name", TEXT)])

        # redis
        if start_redis:
          logger.info("Starting redis...")
          loop = asyncio.get_event_loop()
          self.redis_queue = loop.run_until_complete(create_pool(constants.ARQ_REDIS))

        # these get all the other variables
          logger.info("Starting derivative managers...")
        self.discussion_manager = DiscussionManager(self)
        self.board_manager = BoardManager(self)

    def create(self):
        board = Board()
        board_id = board.short_id
        board.id = board_id

        self.boards.insert_one(board.to_mongo())

        return {"board_id": board_id}

    #### HELPER FUNCTIONS ####

    def _wipe_pith(self, pith):
      return re.sub(constants.LINK_REGEX, constants.LINK_NULL, pith) 

    def _get_transclusion_map(self, board_id, unit_id):
      """
      1) Map of ids to piths. Piths should not have further transclusions. 
      2) Ordered list of ids as presented in first pith, such that pith
      has [n] for [[<id>]].
      """
      unit = self.units.find_one({"short_id": unit_id, "board_id": board_id})
      pith = unit["pith"]

      # map
      transclusions = self.transclusions.find(
        {"source": unit_id, "board_id": board_id}
      )
      target_ids = [t["target"] for t in transclusions]

      if len(target_ids) > 0:
        targets = self.units.find({"short_id": {"$in": target_ids}})
        map_id_pith = {t["short_id"]:self._wipe_pith(t["pith"]) for t in targets}

        iterate = 0
        def numerate(match):
          nonlocal iterate
          iterate += 1
          return "[" + str(iterate) + "]"

        transclusion_list = re.findall(constants.LINK_REGEX, pith)
        trans_pith = re.sub(constants.LINK_REGEX, numerate, pith)
      else:
        map_id_pith = {}
        transclusion_list = []
        trans_pith = pith

      return {
        "map": map_id_pith,
        "list": transclusion_list,
        "pith": trans_pith
      }

    def _get_links_to(self, board_id, unit_id):
      links = self.links.find(
        {"source": unit_id, "board_id": board_id}
      )
      link_list = [{
        "id": l["short_id"],
        "pith": l["pith"],
        "source": l["source"],
        "target": l["target"],
      } for l in links]
      return link_list

    def _get_links_from(self, board_id, unit_id):
      links = self.links.find(
        {"target": unit_id, "board_id": board_id}
      )
      link_list = [{
        "id": l["short_id"],
        "pith": l["pith"],
        "source": l["source"],
        "target": l["target"],
      } for l in links]
      return link_list

    def _get_disc(self, board_id, discussion_id):
      discussion = self.discussions.find_one({"short_id": discussion_id, "board_id": board_id})
      return {
        "id": discussion_id,
        "created": discussion["created"]
      }

    def _get_discussions(self, board_id, unit_id):
      # focused includes unit
      discussions = self.discussions.find(
        {"focused": {"$in": [unit_id]}, "board_id": board_id}
      )
      discussions_list = [{ \
        "id": d["short_id"], \
        "created": d["created"] \
      } for d in discussions]
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

        transclusion = Transclusion(board_id=board_id, source=unit_id, target=t)
        transclusion.id = "{}:{}".format(transclusion.board_id, transclusion.short_id)

        transclusions_list.append(
          transclusion.to_mongo()
        )
      # TODO may result in duplicate error
      if len(transclusions_list) > 0:
        self.transclusions.insert_many(transclusions_list)

    def _remove_transclusions(self, board_id, unit_id):
      self.transclusions.remove({"source": unit_id, "board_id": board_id})

    def _remove_links(self, board_id, unit_id):
      self.links.remove(
        {"source": unit_id, "board_id": board_id}, 
        {"target": unit_id, "board_id": board_id}
      )

    def _get_user(self, board_id, user_id):
      user = self.users.find_one({"short_id": user_id, "board_id": board_id})
      return {
        "id": user_id,
        "nickname": user["nickname"]
      }

    def _get_link(self, board_id, link_id):
      link = self.links.find_one({"short_id": link_id, "board_id": board_id})
      return {
        "id": link_id,
        "pith": link["pith"],
        "source": link["source"],
        "target": link["target"],
      }

    def _get_chat_unit(self, board_id, unit_id):
      unit = self.units.find_one({"short_id": unit_id, "board_id": board_id})
      user = self.users.find_one({"short_id": unit["author"], "board_id": board_id})
      author_id = user["short_id"]
      author_name = user["nickname"]
      return {
        "id": unit_id,
        "pith": unit["pith"],
        "created": unit["created"],
        "author_id": author_id,
        "author_name": author_name,
        "flairs": unit["flairs"],
        "transclusions": self._get_transclusion_map(board_id, unit_id),
        "notice": unit["notice"],
      }      

    def _get_basic_unit(self, board_id, unit_id):
      unit = self.units.find_one({"short_id": unit_id, "board_id": board_id})
      return {
        "id": unit_id,
        "pith": unit["pith"],
        "position": {"x": unit["position"]["x"], "y": unit["position"]["y"]}, 
        "transclusions": self._get_transclusion_map(board_id, unit_id)
      }      

    def _get_extended_unit(self, board_id, unit_id):
      unit = self.units.find_one({"short_id": unit_id, "board_id": board_id})
      return {
        "id": unit_id,
        "pith": unit["pith"],
        "transclusions": self._get_transclusion_map(board_id, unit_id),
        "position": {"x": unit["position"]["x"], "y": unit["position"]["y"]}, 
        "links_to": self._get_links_to(board_id, unit_id),
        "links_from": self._get_links_from(board_id, unit_id),
        "discussions": self._get_discussions(board_id, unit_id)
      }

    def _get_participants(self, board_id, discussion_id):
      participants = self.users.find(
        {"discussion_id": discussion_id, "board_id": board_id}
      )
      return [self._get_user(board_id, p["short_id"]) for p in participants]

    def _chat_page(self, board_id, discussion_id, end_index=None):
      discussion = self.discussions.find_one(
        {"short_id": discussion_id, "board_id": board_id}
      )
      if end_index is None: 
        end_index = len(discussion["chat"])
      if end_index < constants.CHAT_PAGE_SIZE: 
        start_index = 0
      else:
        start_index = end_index - constants.CHAT_PAGE_SIZE
      chat = []
      for u in discussion["chat"][start_index:end_index]:
        chat.append(self._get_chat_unit(board_id, u))
      return (chat, start_index)

    def create_notice_unit(self, board_id, discussion_id, message, user_id):
      # clean it of transclusions
      message = self._wipe_pith(message)

      user = self.users.find_one({"short_id": user_id, "board_id": board_id})
      unit = Unit(board_id=board_id, pith=message, chat=True, 
        author=user_id,
        author_name=user["nickname"],
        flairs=[],
        notice=True
      )
      unit.id = "{}:{}".format(unit.board_id, unit.short_id)

      self.units.insert_one(unit.to_mongo())
      unit_id = unit.short_id
      self.discussions.update_one(
        {"short_id" : discussion_id, "board_id": board_id},
        {"$push": {"chat": unit_id}}
      )
      return unit
