from pymongo import MongoClient
import mongoengine
import socketio

import constants
from models.user_manager import UserManager
from models.discussion_manager import DiscussionManager


class GlobalManager:

    def __init__(self):
        mgr = socketio.AsyncRedisManager(constants.SOCKET_REDIS)
        self.sio = socketio.AsyncServer(
            async_mode='asgi',
            client_manager=mgr,
            cors_allowed_origins="*"
        )
        self.app = socketio.ASGIApp(self.sio)

        self.client = MongoClient(constants.MONGO_CONN)
        mongoengine.connect(constants.MONGODB_NAME, host=constants.MONGO_CONN)

        self.user_manager = UserManager(self)
        self.discussion_manager = DiscussionManager(self)
