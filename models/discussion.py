import uuid

from database import discussions
from search.basic_search import basic_search
from utils import utils


class Discussion():
    def __init__(self, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.tags = []
            self.users = []
            self.history = []
            self.history_blocks = []

def get_discussions(self):
    discussion_cursor = discussions.find()
    discussion_list = []
    for u in discussion_cursor:
        discussion_list.append(u)
    return discussion_list

def get_discussion(self, discussion_id):
    discussion_data = discussions.find_one({ "_id" : discussion_id })
    return discussion_data

def insert_discussion(self, discussion_obj):
    discussion_data = discussion_obj.__dict__
    discussions.insert_one(discussion_data)

def discussion_add_tag(self, discussion_id, tag):
    discussions.update_one({"_id" : discussion_id}, {"$push": {"tags" : tag}})

def discussion_remove_tag(self, discussion_id, tag):
    discussions.update_one({"_id" : discussion_id}, {"$pull": {"tags" : tag}})

def join_discussion(self, discussion_id, user_id): 
    discussions.update_one({"_id" : discussion_id}, {"$push": {"users" : user_id}})

def leave_discussion(self, discussion_id, user_id): 
    discussions.update_one({"_id" : discussion_id}, {"$pull": {"users" : user_id}})

def insert_post_discussion_history(self, discussion_id, post_id):
    discussions.update_one({"_id" : discussion_id}, {"$push": {"history" : post_id}})

def insert_block_discussion_history(self, discussion_id, block_id):
    discussions.update_one({"_id" : discussion_id}, {"$push": {"history_blocks" : block_id}})

def join_discussion(discussion_id, user_id):
    database.join_discussion(discussion_id, user_id)
    discussion_data = database.get_discussion(discussion_id)
    return discussion_data

def leave_discussion(discussion_id, user_id):
    database.leave_discussion(discussion_id, user_id)
    discussion_data = database.get_discussion(discussion_id)
    return discussion_data

def create_post(discussion_id, user_id):
    post_obj = Post(user_id, discussion_id)
    database.insert_post_user_history(user_id, post_obj._id)
    database.insert_post_discussion_history(discussion_id, post_obj._id)

    blocks = json["blocks"]
    block_ids = []
    freq_dicts = []
    for b in blocks:
        block_obj = Block(user_id, discussion_id, post_obj._id, b)
        freq_dicts.append(block_obj.freq_dict)
        block_ids.append(block_obj._id)
        database.insert_block_discussion_history(discussion_id, block_obj._id)
        database.insert_block(block_obj)
        database.index_block(block_obj._id, block_obj.freq_dict)

    post_obj.blocks = block_ids
    post_freq_dict = utils.sum_dicts(freq_dicts)
    post_obj.freq_dict = defaultdict(lambda:0, post_freq_dict)
    database.insert_post(post_obj)

    database.index_post(post_obj._id, post_obj.freq_dict)

    post_data = post_obj.__dict__
    return post_data

def get_discussion_users(self, discussion_id):
    discussion_data = self.get_discussion(discussion_id)
    users = discussion_data["users"]
    return users

def get_discussion_posts(self, discussion_id):
    discussion_data = get_discussion(discussion_id)
    history = discussion_data["history"]
    return history

def get_discussion_blocks(self, discussion_id):
    discussion_data = get_discussion(discussion_id)
    history = discussion_data["history_blocks"]
    return history

def post_add_tag(post_id, tag):
    database.post_add_tag(post_id, tag)
    post_data = database.get_post(post_id)
    return post_data

def block_add_tag(block_id, tag):
    database.block_add_tag(block_id, tag)
    block_data = database.get_block(block_id)
    return block_data

def post_remove_tag(block_id, tag):
    database.post_remove_tag(post_id, tag)
    post_data = database.get_post(post_id)
    return post_data

def block_remove_tag(block_id, tag):
    database.block_remove_tag(block_id, tag)
    block_data = database.get_block(block_id)
    return block_data

def discussion_scope_search(query, discussion_id):
    post_ids = database.get_discussion_posts(discussion_id)
    block_ids = database.get_discussion_blocks(discussion_id)
    return basic_search(query, block_ids, post_ids)
