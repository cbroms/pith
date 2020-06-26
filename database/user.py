"""
User getters and setters 
"""

from constants import (
    users,        
)
from discussion import (
    get_discussion,        
)


class UserDatabase:

    def get_users(self):
        user_cursor = users.find()
        user_list = []
        for u in user_cursor:
            user_list.append(u)
        return user_list

    def get_discussion_users(self, discussion_id):
        discussion_data = get_discussion(discussion_id)
        users = discussion_data["users"]
        return users

    def get_user(self, user_id):
        user_data = users.find_one({ "_id" : user_id })
        return user_data

    def insert_user(self, user_obj):
        user_data = user_obj.__dict__
        users.insert_one(user_data)

    def insert_post_user_history(self, user_id, post_id):
        users.update_one({"_id" : user_id}, {"$push": {"history" : post_id}})
