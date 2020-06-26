"""
Discussion getters and setters 
"""

from constants import (
    discussions,
)
from users import (
    get_user,
)


class DiscussionDatabase:

    def get_discussions(self):
        discussion_cursor = discussions.find()
        discussion_list = []
        for u in discussion_cursor:
            discussion_list.append(u)
        return discussion_list

    def get_user_saved_discussions(self, user_id):
        user_data = get_user(user_id)
        saved = user_data["library"]["discussions"]
        return saved

    def get_discussion(self, discussion_id):
        discussion_data = discussions.find_one({ "_id" : discussion_id })
        return discussion_data

    def save_discussion(self, discussion_id, user_id):
        users.update_one({"_id" : user_id}, 
            {"$push" : {"library.discussions" : discussion_id}})

    def insert_discussion(self, discussion_obj):
        discussion_data = discussion_obj.__dict__
        discussions.insert_one(discussion_data)

    def insert_post_discussion_history(self, discussion_id, post_id):
        discussions.update_one({"_id" : discussion_id}, {"$push": {"history" : post_id}})

    def insert_block_discussion_history(self, discussion_id, block_id):
        discussions.update_one({"_id" : discussion_id}, {"$push": {"history_blocks" : block_id}})

    def discussion_add_tag(self, discussion_id, tag):
        discussions.update_one({"_id" : discussion_id}, {"$push": {"tags" : tag}})

    def discussion_remove_tag(self, discussion_id, tag):
        discussions.update_one({"_id" : discussion_id}, {"$pull": {"tags" : tag}})

    def join_discussion(self, discussion_id, user_id): 
        discussions.update_one({"_id" : discussion_id}, {"$push": {"users" : user_id}})

    def leave_discussion(self, discussion_id, user_id): 
        discussions.update_one({"_id" : discussion_id}, {"$pull": {"users" : user_id}})
