"""
Peruse following for more efficient updates:
- https://stackoverflow.com/questions/4372797/how-do-i-update-a-mongo-document-after-inserting-it
- https://stackoverflow.com/questions/33189258/append-item-to-mongodb-document-array-in-pymongo-without-re-insertion

If things go wonky, try:
sudo rm /var/lib/mongodb/mongod.lock
sudo service mongodb start
"""

from pymongo import MongoClient 
from models.discussion import Discussion
from models.user import User
from models.post import Post
from models.block import Block
#from models.keyword import Keyword


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


"""
User getters and setters 
"""

def get_users():
    user_cursor = users.find()
    user_list = []
    for u in user_cursor:
        user_list.append(u)
    return user_list


def get_discussion_users(discussion_id):
    discussion_data = get_discussion(discussion_id)
    users = discussion_data["users"]
    return users


def get_user(user_id):
    user_data = users.find_one({ "_id" : user_id })
    return user_data


def insert_user(user_obj):
    user_data = user_obj.__dict__
    users.insert_one(user_data)


def insert_post_user_history(user_id, post_id):
    users.update_one({"_id" : user_id}, {"$push": {"history" : post_id}})


def join_discussion(discussion_id, user_id): 
    discussions.update_one({"_id" : discussion_id}, {"$push": {"users" : user_id}})


def leave_discussion(discussion_id, user_id): 
    discussions.update_one({"_id" : discussion_id}, {"$pull": {"users" : user_id}})


"""
Post getters and setters 
"""

def get_posts():
    post_cursor = posts.find()
    post_list = []
    for u in post_cursor:
        post_list.append(u)
    return post_list


def get_discussion_posts(discussion_id):
    discussion_data = get_discussion(discussion_id)
    history = discussion_data["history"]
    return history


def get_user_saved_posts(user_id):
    user_data = get_user(user_id)
    saved = user_data["library"]["posts"]
    return saved


def get_post(post_id):
    post_data = posts.find_one({ "_id" : post_id })
    return post_data


def insert_post(post_obj):
    post_data = post_obj.__dict__
    posts.insert_one(post_data)


def save_post(post_id, user_id):
    users.update_one({"_id" : user_id}, {"$push" : {"library.posts" : post_id}})


def post_add_tag(post_id, tag):
    posts.update_one({"_id" : post_id}, {"$push": {"tags" : tag}})


def post_remove_tag(post_id, tag):
    posts.update_one({"_id" : post_id}, {"$pull": {"tags" : tag}})


"""
Block getters and setters 
"""

def get_blocks():
    block_cursor = blocks.find()
    block_list = []
    for u in block_cursor:
        block_list.append(u)
    return block_list


def get_user_saved_blocks(user_id):
    user_data = get_user(user_id)
    saved = user_data["library"]["blocks"]
    return saved


def get_block(block_id):
    block_data = blocks.find_one({ "_id" : block_id })
    return block_data


def insert_block(block_obj):
    block_data = block_obj.__dict__
    blocks.insert_one(block_data)


def save_block(block_id, user_id):
    users.update_one({"_id" : user_id}, {"$push" : {"library.blocks" : block_id}})


def block_add_tag(block_id, tag):
    blocks.update_one({"_id" : block_id}, {"$push": {"tags" : tag}})


def block_remove_tag(block_id, tag):
    blocks.update_one({"_id" : block_id}, {"$pull": {"tags" : tag}})


"""
Keywords getters and setters 
"""

def get_keyword_blocks(keyword):
    keyword_data = keywords.find_one({ "_id" : keyword })
    if not keyword_data: return {}
    blocks = keyword_data["blocks"]
    return blocks


def add_keyword_block(keyword, block_id, freq):
    keywords.update_one(
        {"_id" : keyword},
        {"$set": {"blocks" : {block_id : {"freq" : freq}}}},
        upsert=True
    )


def index_block(block_id, freq_dict):
    for k,f in freq_dict.items():
        add_keyword_block(k, block_id, f)


def get_keyword_posts(keyword):
    keyword_data = keywords.find_one({ "_id" : keyword })
    if not keyword_data: return {}
    posts = keyword_data["posts"]
    return posts


def add_keyword_post(keyword, post_id, freq):
    keywords.update_one(
        {"_id" : keyword},
        {"$set": {"posts" : {post_id : {"freq" : freq}}}},
        upsert=True
    )


def index_post(post_id, freq_dict):
    for k,f in freq_dict.items():
        add_keyword_post(k, post_id, f)


"""
Discussion getters and setters 
"""

def get_discussions():
    discussion_cursor = discussions.find()
    discussion_list = []
    for u in discussion_cursor:
        discussion_list.append(u)
    return discussion_list


def get_user_saved_discussions(user_id):
    user_data = get_user(user_id)
    saved = user_data["library"]["discussions"]
    return saved


def get_discussion(discussion_id):
    discussion_data = discussions.find_one({ "_id" : discussion_id })
    return discussion_data


def save_discussion(discussion_id, user_id):
    users.update_one({"_id" : user_id}, 
        {"$push" : {"library.discussions" : discussion_id}})


def insert_discussion(discussion_obj):
    discussion_data = discussion_obj.__dict__
    discussions.insert_one(discussion_data)


def insert_post_discussion_history(discussion_id, post_id):
    discussions.update_one({"_id" : discussion_id}, {"$push": {"history" : post_id}})
