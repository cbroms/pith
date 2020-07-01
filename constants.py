import socketio
from pymongo import MongoClient 

sio = socketio.AsyncServer(
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
