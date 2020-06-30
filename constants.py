from flask import Flask
from flask_socketio import SocketIO, emit
from json import dumps, JSONEncoder
from pymongo import MongoClient 
from uuid import UUID

from models.user_manager import UserManager
from models.discussion_manager import DiscussionManager

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

client = MongoClient('mongodb://localhost:27017')
try:
    client.drop_database("db")
except Exception:
db = client["db"]

discussion_manager = DiscussionManager(db)
user_manager = UserManager(db)
