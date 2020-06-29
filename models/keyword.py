# TODO maybe don't need, as blocks/posts can't be seen outside discussion

import uuid

from utils import utils


class Keyword():
    def __init__(self, _id, **entries):
        self._id = _id
        self.blocks = {} # id : {"freq" : freq}
        self.posts = {} # id : {"freq" : freq}

def get_keyword_blocks(self, keyword):
    keyword_data = keywords.find_one({ "_id" : keyword })
    if not keyword_data: return {}
    blocks = keyword_data["blocks"]
    return blocks

def add_keyword_block(self, keyword, block_id, freq):
    keywords.update_one(
        {"_id" : keyword},
        {"$set": {"blocks.{}".format(block_id) : {"freq" : freq}}},
        upsert=True
    )

def get_keyword_posts(self, keyword):
    keyword_data = keywords.find_one({ "_id" : keyword })
    if not keyword_data: return {}
    posts = keyword_data["posts"]
    return posts

def add_keyword_post(self, keyword, post_id, freq):
    keywords.update_one(
        {"_id" : keyword},
        {"$set": {"posts.{}".format(post_id) : {"freq" : freq}}},
        upsert=True
    )

def index_block(self, block_id, freq_dict):
    for k,f in freq_dict.items():
        self.add_keyword_block(k, block_id, f)

def index_post(self, post_id, freq_dict):
    for k,f in freq_dict.items():
        self.add_keyword_post(k, post_id, f)
