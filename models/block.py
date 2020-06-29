from collections import defaultdict
import uuid

from database import blocks
from utils import utils


class Block():
    def __init__(self, user, discussion, post, body, **entries):
        if "_id" in entries: # reload
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.user = user
            self.discussion = discussion
            self.post = post
            self.body = body
            self.tags = []
            self.freq_dict = utils.make_freq_dict(self.body)
        self.freq_dict = defaultdict(lambda:0, self.freq_dict) 

def get_blocks(self):
    block_cursor = blocks.find()
    block_list = []
    for u in block_cursor:
        block_list.append(u)
    return block_list

def get_block(self, block_id):
    block_data = blocks.find_one({ "_id" : block_id })
    return block_data

def insert_block(self, block_obj):
    block_data = block_obj.__dict__
    blocks.insert_one(block_data)

def block_add_tag(self, block_id, tag):
    blocks.update_one({"_id" : block_id}, {"$push": {"tags" : tag}})

def block_remove_tag(self, block_id, tag):
    blocks.update_one({"_id" : block_id}, {"$pull": {"tags" : tag}})
