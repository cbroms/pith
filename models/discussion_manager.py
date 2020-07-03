from utils import utils

from models.block import Block
from models.discussion import Discussion
from models.post import Post
from models.tag import Tag

from search.basic_search import basic_search
from user_constants import user_manager


class DiscussionManager:

    def __init__(self, db):
        self.discussions = db["discussions"]

    """
    Of discussions.
    """
    def _insert(self, discussion_obj):
        discussion_data = discussion_obj.__dict__
        self.discussions.insert_one(discussion_data)

    def get(self, discussion_id):
        discussion_data = self.discussions.find_one({ "_id" : discussion_id })
        return discussion_data

    def get_all(self):
        discussion_cursor = self.discussions.find()
        discussion_list = []
        for u in discussion_cursor:
            discussion_list.append(u["_id"])
        return discussion_list

    def create(self):
        discussion_obj = Discussion()
        self._insert(discussion_obj)
        discussion_data = discussion_obj.__dict__
        return discussion_data

    """
    Within a discussion.
    First arg is always `discussion_id`.
    """

    def _is_user(self, discussion_id, user_id):
        discussion_data = self.get(discussion_id)
        return user_id in discussion_data["users"]

    def join(self, discussion_id, user_id):
        if not self._is_user(discussion_id, user_id):
            user_manager.join_discussion(user_id, discussion_id)
            self.discussions.update_one({"_id" : discussion_id}, \
                {"$push": {"users" : user_id}})
        discussion_data = self.get(discussion_id)
        return discussion_data

    def leave(self, discussion_id, user_id):
        user_manager.leave_discussion(user_id, discussion_id)
        if self._is_user(discussion_id, user_id):
            self.discussions.update_one({"_id" : discussion_id}, \
                {"$pull": {"users" : user_id}})
        discussion_data = self.get(discussion_id)
        return discussion_data

    def get_users(self, discussion_id):
        discussion_data = self.get(discussion_id)
        user_ids = discussion_data["users"]
        return user_ids

    def create_post(self, discussion_id, user_id, blocks):
        post_obj = Post(user_id)
        post_id = post_obj._id

        block_ids = []
        freq_dicts = []
        for b in blocks:
            block_obj = Block(user_id, post_id, b)
            freq_dicts.append(block_obj.freq_dict)
            block_id = block_obj._id
            block_ids.append(block_id)
            block_data = block_obj.__dict__
            self.discussions.update_one({"_id" : discussion_id}, \
                {"$set": {"history_blocks.{}".format(block_id) : block_data}})

        post_obj.blocks = block_ids
        post_freq_dict = utils.sum_dicts(freq_dicts)
        post_data = post_obj.__dict__
        self.discussions.update_one({"_id" : discussion_id}, \
            {"$set": {"history.{}".format(post_id) : post_data}})
        user_manager.insert_post_user_history(user_id, post_id)

        return post_data

    def get_post(self, discussion_id, post_id):
        discussion_data = self.get(discussion_id)
        post_data = discussion_data["history"][post_id]
        return post_data

    def get_posts(self, discussion_id):
        discussion_data = self.get(discussion_id)
        history = discussion_data["history"]
        return list(history.values()) # give data

    def get_block(self, discussion_id, block_id):
        discussion_data = self.get(discussion_id)
        block_data = discussion_data["history_blocks"][block_id]
        return block_data

    def get_blocks(self, discussion_id):
        discussion_data = self.get(discussion_id)
        history_blocks = discussion_data["history_blocks"]
        return history_blocks.values() # give data

    def _is_tag(self, discussion_id, tag):
        discussion_data = self.get(discussion_id)
        return tag in discussion_data["internal_tags"]

    def _get_tag(self, discussion_id, tag):
        assert(self._is_tag(discussion_id, tag))
        discussion_data = self.get(discussion_id)
        tag_data = discussion_data["internal_tags"][tag]
        return tag_data

    def _is_tag_owner_post(self, discussion_id, user_id, post_id, tag):
        assert(self._is_tag(discussion_id, tag))
        post_data = self.get_post(discussion_id, post_id)
        assert(tag in post_data["tags"])
        return post_data["tags"][tag]["owner"]

    def _is_tag_owner_block(self, discussion_id, user_id, block_id, tag):
        assert(self._is_tag(discussion_id, tag))
        block_data = self.get_block(discussion_id, block_id)
        assert(tag in block_data["tags"])
        return block_data["tags"][tag]["owner"]

    def _create_tag(self, discussion_id, tag):
        if not self._is_tag(discussion_id, tag):
            tag_obj = Tag()
            tag_data = tag_obj.__dict__
            self.discussions.update_one({"_id" : discussion_id}, \
                {"$set": {"internal_tags.{}".format(tag) : tag_data}})
        else:
            tag_data = self._get_tag(discussion_id, tag)
        return tag_data

    def _is_tag_post(self, discussion_id, post_id, tag):
        """
        Only use this once the tag has been created for the discussion.
        """
        assert(self._is_tag(discussion_id, tag))
        post_data = self.get_post(discussion_id, post_id)
        return tag in post_data["tags"]

    def post_add_tag(self, discussion_id, user_id, post_id, tag):
        tag_data = self._create_tag(discussion_id, tag)
        if not self._is_tag_post(discussion_id, post_id, tag):
            self.discussions.update_one({"_id" : discussion_id}, \
                {"$set": {"history.{}.tags.{}".format(post_id, tag) : \
                {"owner": user_id}}})

    def post_remove_tag(self, discussion_id, user_id, post_id, tag):
        if self._is_tag_post(discussion_id, post_id, tag):
            if self._is_tag_owner_post(discussion_id, user_id, block_id, tag):
                self.discussions.update_one({"_id" : discussion_id}, \
                    {"$unset": {"history.{}.tags".format(post_id) : tag}})

    def _is_tag_block(self, discussion_id, block_id, tag):
        """
        Only use this once the tag has been created for the discussion.
        """
        assert(self._is_tag(discussion_id, tag))
        block_data = self.get_block(discussion_id, block_id)
        return tag in block_data["tags"]

    def block_add_tag(self, discussion_id, user_id, block_id, tag):
        tag_data = self._create_tag(discussion_id, user_id, tag)
        if not self._is_tag_block(discussion_id, block_id, tag):
            self.discussions.update_one({"_id" : discussion_id}, \
                {"$set": {"history.{}.tags.{}".format(block_id, tag) : \
                {"owner": user_id}}})

    def block_remove_tag(self, discussion_id, user_id, block_id, tag):
        if self._is_tag_block(discussion_id, block_id, tag):
            if self._is_tag_owner_block(discussion_id, user_id, block_id, tag):
                self.discussions.update_one({"_id" : discussion_id}, \
                    {"$unset": {"history.{}.tags".format(block_id) : tag}})

    def discussion_scope_search(self, discussion_id, query):
        post_ids = self.get_posts(discussion_id)
        block_ids = self.get_blocks(discussion_id)
        posts_data = {
            p: discussion_manager.get_post(discussion_id, p) \
            for p in post_ids
        }
        blocks_data = {
            b: discussion_manager.get_block(discussion_id, b) \
            for b in block_ids
        }
        return basic_search(query, blocks_data, posts_data)
