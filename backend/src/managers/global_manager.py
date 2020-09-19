import asyncio
from aiohttp import web
from arq import create_pool
from pymongo import MongoClient
import mongoengine
import socketio

import constants
from managers.user_manager import UserManager
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
        self.client = MongoClient(constants.MONGODB_CONN)
        mongoengine.connect(constants.MONGODB_NAME, host=constants.MONGODB_CONN)

        loop = asyncio.get_event_loop()
        self.redis_queue = loop.run_until_complete(create_pool(constants.ARQ_REDIS))

        # these get all the other variables
        self.user_manager = UserManager(self)
        self.discussion_manager = DiscussionManager(self)