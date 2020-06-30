import socketio
from pymongo import MongoClient 
from uuid import UUID

from models.user_manager import UserManager
from models.discussion_manager import DiscussionManager

app = socketio.ASGIApp(sio)
socketio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[
        "http://localhost:3000",
        "https://dev1.pith.rainflame.com"
    ]
)

client = MongoClient('mongodb://localhost:27017')
try:
    client.drop_database("db")
except Exception:
	db = client["db"]

discussion_manager = DiscussionManager(db)
user_manager = UserManager(db)
