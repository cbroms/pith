from pymongo import MongoClient

from models.user_manager import UserManager
from models.discussion_manager import DiscussionManager


class GlobalManager:

    def __init__(self):
        client = MongoClient('mongodb://localhost:27017')
        db = client["db"]

        # create manager instances
        self.user_manager = UserManager(db)
        self.discussion_manager = DiscussionManager(db)

        # exchange TODO: may eventually decide to just pass in self (global manager)
        self.user_manager.discussion_manager = self.discussion_manager
        self.discussion_manager.user_manager = self.user_manager
