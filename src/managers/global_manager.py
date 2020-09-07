from aiohttp import web
import logging
from pymongo import MongoClient
import mongoengine
import socketio
import time

import constants
from managers.user_manager import UserManager
from managers.discussion_manager import DiscussionManager


class GlobalManager:

    def __init__(self):
        self.user_manager = UserManager(self)
        self.discussion_manager = DiscussionManager(self)

        mgr = socketio.AsyncRedisManager(constants.SOCKET_REDIS)
        self.sio = socketio.AsyncServer(
            async_mode='aiohttp',
            client_manager=mgr,
            cors_allowed_origins="*"
        )
        self.app = socketio.ASGIApp(self.sio)
        self.aio_app = web.Application()
        self.sio.attach(self.aio_app)

        self.client = MongoClient(constants.MONGODB_CONN)
        mongoengine.connect(constants.MONGODB_NAME, host=constants.MONGODB_CONN)
