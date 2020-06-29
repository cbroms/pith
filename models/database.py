"""
Peruse following for more efficient updates:
- https://stackoverflow.com/questions/4372797/how-do-i-update-a-mongo-document-after-inserting-it
- https://stackoverflow.com/questions/33189258/append-item-to-mongodb-document-array-in-pymongo-without-re-insertion

If things go wonky, try:
sudo rm /var/lib/mongodb/mongod.lock
sudo service mongodb start
"""

from pymongo import MongoClient 


client = MongoClient('mongodb://localhost:27017')
print("Created client")
try:
    client.drop_database("db")
    print("Refreshing database")
except Exception:
    print("New database")
db = client["db"]
discussions = db["discussions"]
users = db["users"]
posts = db["posts"]
blocks = db["blocks"]
keywords = db["keywords"]

