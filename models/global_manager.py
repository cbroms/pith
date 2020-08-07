from pymongo import MongoClient

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
        self.db = self.client["db"]

        # create manager instances
        self.user_manager = UserManager(self, self.db)
        self.discussion_manager = DiscussionManager(self, self.sio, self.db)
