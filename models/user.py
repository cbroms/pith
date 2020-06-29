from search.basic_search import basic_search
from database import users

class User():
    def __init__(self, _id, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = _id
            self.library = {}
            self.library["discussions"] = [] # saved discussions
            self.library["posts"] = [] # saved posts
            self.library["blocks"] = [] # saved blocks
            self.history = [] # list of posts
            self.discussions = [] # list of discussions user is in

def get_users(self):
    user_cursor = users.find()
    user_list = []
    for u in user_cursor:
        user_list.append(u)
    return user_list

def get_user(self, user_id):
    user_data = users.find_one({ "_id" : user_id })
    return user_data

def insert_user(self, user_obj):
    user_data = user_obj.__dict__
    users.insert_one(user_data)

def insert_post_user_history(self, user_id, post_id):
    users.update_one({"_id" : user_id}, {"$push": {"history" : post_id}})

def save_discussion(self, discussion_id, user_id):
    users.update_one({"_id" : user_id}, 
        {"$push" : {"library.discussions" : discussion_id}})

def unsave_discussion(self, discussion_id, user_id):
    users.update_one({"_id" : user_id}, {"$pull" : {"library.discussions" : discussion_id}})

# TODO in discussion scope, have a "save" state in post
def save_post(self, post_id, user_id):
    users.update_one({"_id" : user_id}, {"$push" : {"library.posts" : post_id}})

# TODO in discussion scope, have a "save" state in post
def unsave_post(self, post_id, user_id):
    users.update_one({"_id" : user_id}, {"$pull" : {"library.posts" : post_id}})

# TODO in discussion scope, have a "save" state in post
def save_block(self, block_id, user_id):
    users.update_one({"_id" : user_id}, {"$push" : {"library.blocks" : block_id}})

# TODO in discussion scope, have a "save" state in post
def unsave_block(self, block_id, user_id):
    users.update_one({"_id" : user_id}, {"$pull" : {"library.blocks" : block_id}})

def user_saved_scope_search(query, user_id):
    post_ids = database.get_user_saved_posts(user_id)
    block_ids = database.get_user_saved_blocks(user_id)
    return basic_search(query, block_ids, post_ids)
