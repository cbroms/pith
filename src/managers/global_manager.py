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

    def __init__(self, test: bool = False):
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

        MONGO_CONN = constants.MONGO_CONN
        MONGODB_NAME = constants.MONGODB_NAME
        if test:
            MONGO_CONN = constants.MONGO_CONN_TEST
            MONGODB_NAME = constants.MONGODB_NAME_TEST
        self.client = MongoClient(MONGO_CONN)
        mongoengine.connect(MONGODB_NAME, host=MONGO_CONN)
        logging.info("conn: {}\tname: {}".format(MONGO_CONN, MONGODB_NAME))
        logging.info("Sleeping for a minute to start up mongo...")
        time.sleep(60)
