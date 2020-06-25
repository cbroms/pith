"""
Keywords getters and setters 
"""

from constants import (
    keywords,
)


def get_keyword_blocks(keyword):
    keyword_data = keywords.find_one({ "_id" : keyword })
    if not keyword_data: return {}
    blocks = keyword_data["blocks"]
    return blocks


def add_keyword_block(keyword, block_id, freq):
    keywords.update_one(
        {"_id" : keyword},
        {"$set": {"blocks.{}".format(block_id) : {"freq" : freq}}},
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
        {"$set": {"posts.{}".format(post_id) : {"freq" : freq}}},
        upsert=True
    )


def index_post(post_id, freq_dict):
    for k,f in freq_dict.items():
        add_keyword_post(k, post_id, f)
