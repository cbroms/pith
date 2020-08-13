"""
API relating to the user.
"""
from models.user import User


class UserManager:

    def __init__(self, gm, db):
        self.users = db["users"]
        self.gm = gm

    """
    Of users.
    """

    def _insert(self, user_obj):
        user_data = user_obj.__dict__
        self.users.insert_one(user_data)

    def _is_user(self, user_id):
        user_data = self.get(user_id)
        return not (user_data is None)

    def get(self, user_id):
        user_data = self.users.find_one({ "_id" : user_id })
        return user_data

    def get_all(self):
        user_cursor = self.users.find()
        user_list = []
        for u in user_cursor:
            user_list.append(u)
        return user_list

    def create(self, ip):
        if not self._is_user(ip):
            user_obj = User(_id=ip)
            self._insert(user_obj)

    """
    Within a user.
    First arg is always `user_id`.
    TODO maybe use a wrapper that takes in user_id and gives user_data.
    """

    def _is_discussion_user(self, user_id, discussion_id):
        user_data = self.get(user_id)
        return discussion_id in user_data["discussions"]

    def _is_active_discussion(self, user_id, discussion_id):
        """
        A discussion is not active if it is
        1) not made,
        2) not active.
        """
        user_data = self.get(user_id)
        if discussion_id not in user_data["discussions"]: return False
        return user_data["discussions"][discussion_id]["active"]

    def join_discussion(self, user_id, discussion_id, name):
        """
        Discussion should check we are not in, or active.
        """
        #TODO taking this out as may join from new tab
        #assert(not self._is_active_discussion(user_id, discussion_id))
        if self._is_discussion_user(user_id, discussion_id): # rejoin
            self.users.update_one({"_id" : user_id}, {"$set": \
                {"discussions.{}.active".format(discussion_id) : True}})
        else:
            self.users.update_one({"_id" : user_id}, {"$set": \
                {"discussions.{}".format(discussion_id) : { 
                    "active": True,
                    "name": name,
                    "history": [],
                    "library": {
                        "posts": {},
                        "blocks": {},
                    } 
                }
            }})

    def leave_discussion(self, user_id, discussion_id):
        """
        Discussion should check we are in, or active.
        """
        assert(self._is_active_discussion(user_id, discussion_id))
        self.users.update_one({"_id" : user_id}, {"$set": \
            {"discussions.{}.active".format(discussion_id) : False}})

    def insert_post_user_history(self, user_id, discussion_id, post_id):
        self.users.update_one({"_id" : user_id}, {"$push": \
            {"discussions.{}.history".format(discussion_id) : post_id}})

    def _is_saved_post(self, user_id, discussion_id, post_id):
        user_data = self.get(user_id)
        return post_id in user_data["discussions"][discussion_id]["library"]["posts"]

    def save_post(self, user_id, discussion_id, post_id):
        if not self._is_saved_post(user_id, discussion_id, post_id):
            self.users.update_one({"_id" : user_id}, {"$set" : \
                {"discussions.{}.library.posts.{}".format(discussion_id, post_id) : 0}})

    def unsave_post(self, user_id, discussion_id, post_id):
        if self._is_saved_post(user_id, discussion_id, post_id):
            self.users.update_one({"_id" : user_id}, {"$unset" : \
                {"discussions.{}.library.posts.{}".format(discussion_id, post_id): 0}})

    def get_user_saved_post_ids(self, user_id, discussion_id):
        user_data = self.get(user_id)
        return list(user_data["discussions"][discussion_id]["library"]["posts"].keys())

    def _is_saved_block(self, user_id, discussion_id, block_id):
        user_data = self.get(user_id)
        return block_id in user_data["discussions"][discussion_id]["library"]["blocks"]

    def save_block(self, user_id, discussion_id, block_id):
        if not self._is_saved_block(user_id, discussion_id, block_id):
            self.users.update_one({"_id" : user_id}, {"$push" : \
                {"discussions.{}.library.blocks.{}".format(discussion_id, block_id) : 0}})

    def unsave_block(self, user_id, discussion_id, block_id):
        if self._is_saved_block(user_id, discussion_id, block_id):
            self.users.update_one({"_id" : user_id}, {"$unset" : \
                {"discussions.{}.library.blocks.{}".format(discussion_id, block_id) : 0}})

    def get_user_saved_block_ids(self, user_id, discussion_id):
        user_data = self.get(user_id)
        return list(user_data["discussions"][discussion_id]["library"]["blocks"].keys())
