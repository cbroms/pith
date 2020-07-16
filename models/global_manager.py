from pymongo import MongoClient
import socketio

from models.user_manager import UserManager
from models.discussion_manager import DiscussionManager


class GlobalManager:

    def __init__(self):
        self.sio = socketio.AsyncServer(
            async_mode='asgi',
            cors_allowed_origins=[
                "http://localhost:3000",
                "https://dev1.pith.rainflame.com"
            ]
        )
        self.app = socketio.ASGIApp(self.sio)

        self.client = MongoClient('mongodb://localhost:27017')
        self.db = self.client["db"]

        # create manager instances
        self.user_manager = UserManager(self, self.db)
        self.discussion_manager = DiscussionManager(self, self.sio, self.db)
