"""
Peruse following for more efficient updates:
https://stackoverflow.com/questions/4372797/how-do-i-update-a-mongo-document-after-inserting-it
!!! https://stackoverflow.com/questions/33189258/append-item-to-mongodb-document-array-in-pymongo-without-re-insertion
"""

from pymongo import MongoClient 
from models.user import User
from models.post import Post
from models.block import Block


client = MongoClient('mongodb://localhost:27017')
try:
    client.drop_database("db")
except Exception:
    print("New database")
db = client["db"]
users = db["users"]
posts = db["posts"]
blocks = db["blocks"]


"""
User getters and setters 
"""

def get_users():
    user_cursor = users.find()
    user_list = []
    for u in user_cursor:
        user_list.append(u)
    return user_list


def get_user(user_id):
    user_data = users.find_one({ "_id" : user_id })
    return user_data


def get_user_obj(user_id):
    user_data = get_user(user_id)
    user_obj = User(**user_data)
    return user_obj


def insert_user(user_obj):
    user_data = user_obj.__dict__
    users.insert_one(user_data)


def update_user(user_obj):
    user_data = user_obj.__dict__
    users.replace_one({"_id" : user_data["_id"]}, user_data)


def insert_post_history(user_id, post_id):
    users.update_one({"_id" : user_id}, {"$push": {"history" : post_id}})



"""
Post getters and setters 
"""

def get_posts():
    post_cursor = posts.find()
    post_list = []
    for u in post_cursor:
        post_list.append(u)
    return post_list


def get_post(post_id):
    post_data = posts.find_one({ "_id" : post_id })
    return post_data


def get_post_obj(post_id):
    post_data = get_post(post_id)
    post_obj = Post(**post_data)
    return post_obj


def insert_post(post_obj):
    post_data = post_obj.__dict__
    posts.insert_one(post_data)


# AVOID
def update_post(post_obj):
    post_data = post_obj.__dict__
    posts.replace_one({"_id" : post_data["_id"]}, post_data)


def save_post(post_id, user_id):
    users.update_one({"_id" : user_id}, {"$push" : {"library.posts" : post_id}})


def post_add_tag(post_id, tag):
    posts.update_one({"_id" : post_id}, {"$push": {"tags" : tag}})


"""
Block getters and setters 
"""

def get_blocks():
    block_cursor = blocks.find()
    block_list = []
    for u in block_cursor:
        block_list.append(u)
    return block_list


def get_block(block_id):
    block_data = blocks.find_one({ "_id" : block_id })
    return block_data


def get_block_obj(block_id):
    block_data = get_block(block_id)
    block_obj = Block(**block_data)
    return block_obj


def insert_block(block_obj):
    block_data = block_obj.__dict__
    blocks.insert_one(block_data)


def update_block(block_obj):
    block_data = block_obj.__dict__
    blocks.replace_one({"_id" : block_data["_id"]}, block_data)


def save_block(block_id, user_id):
    users.update_one({"_id" : user_id}, {"$push" : {"library.blocks" : block_id}})


def block_add_tag(block_id, tag):
    blocks.update_one({"_id" : block_id}, {"$push": {"tags" : tag}})
