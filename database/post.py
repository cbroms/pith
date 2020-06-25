"""
Post getters and setters 
"""

from constants import (
    posts,
)
from discussion import (
    get_discussion,        
)
from user import (
    get_user,        
)


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
