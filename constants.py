
from pymongo import MongoClient 
from models.user_manager import UserManager
from models.discussion_manager import DiscussionManager

client = MongoClient('mongodb://localhost:27017')
try:
    client.drop_database("db")
except Exception:
    db = client["db"]

user_manager = UserManager(db)
discussion_manager = DiscussionManager(db)

