from collections import defaultdict
from datetime import datetime
import uuid

from database import posts

# using ISO so this can be easily parsed in js with Date()
date_time_fmt = "%Y-%m-%dT%H:%M:%SZ" 


class Post():
    def __init__(self, user, discussion, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = uuid.uuid4().hex
            self.user = user
            self.discussion = discussion
            self.blocks = None
            self.freq_dict = None
            self.tags = []
            self.created_at = datetime.utcnow().strftime(date_time_fmt)
            # convert back: datetime.strptime(self.created_at, date_time_fmt)

def get_posts(self):
    post_cursor = posts.find()
    post_list = []
    for u in post_cursor:
        post_list.append(u)
    return post_list

def get_post(self, post_id):
    post_data = posts.find_one({ "_id" : post_id })
    return post_data

def insert_post(self, post_obj):
    post_data = post_obj.__dict__
    posts.insert_one(post_data)

def post_add_tag(self, post_id, tag):
    posts.update_one({"_id" : post_id}, {"$push": {"tags" : tag}})

def post_remove_tag(self, post_id, tag):
    posts.update_one({"_id" : post_id}, {"$pull": {"tags" : tag}})
