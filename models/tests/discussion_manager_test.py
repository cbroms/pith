import logging
import sys
import unittest
import uuid

from models.discussion_manager import DiscussionManager
from models.user_manager import UserManager
from models.discussion import Discussion
from models.user import User
from models.post import Post
from models.block import Block

from user_constants import user_manager


class DiscussionManagerTest(unittest.TestCase):

    def setUp(self):
        from pymongo import MongoClient 
        client = MongoClient('mongodb://localhost:27017')
        db = client["db"]
        self.log = logging.getLogger("DiscussionManagerTest")
        self.discussion_manager = DiscussionManager(db)
        # user_manager = UserManager(db)
        # use this instead of constants user_manager

    def test_create_get(self):
        discussion_data = self.discussion_manager.create()
        discussion_id = discussion_data["_id"]
        discussion_data = self.discussion_manager.get(discussion_id)
        self.assertFalse(discussion_data is None)
        discussion_ids = self.discussion_manager.get_all()
        self.assertTrue(discussion_id in discussion_ids)

    def test_join_leave(self):
        ip = "12345"
        user_manager.create(ip)
        discussion_data = self.discussion_manager.create()
        discussion_id = discussion_data["_id"]
        self.discussion_manager.join(discussion_id, ip)
        user_ids = self.discussion_manager.get_users(discussion_id)
        self.assertTrue(ip in user_ids)

        self.discussion_manager.leave(discussion_id, ip)
        user_ids = self.discussion_manager.get_users(discussion_id)
        self.assertFalse(ip in user_ids)

    def test_post_block(self):
        ip1 = "12345"
        ip2 = "67890"
        user_manager.create(ip1)
        user_manager.create(ip2)
        discussion_data = self.discussion_manager.create()
        discussion_id = discussion_data["_id"]
        self.discussion_manager.join(discussion_id, ip1)
        self.discussion_manager.join(discussion_id, ip2)

        blocks1 = ["I am Fred.", "You are Fred.", "We are Fred."]
        blocks2 = ["She is Lee.", "They are Lee."]
        post_data1 = self.discussion_manager.create_post(discussion_id, ip1, blocks1)
        post_id1 = post_data1["_id"]
        post_data1 = self.discussion_manager.get_post(discussion_id, post_id1)
        self.assertFalse(post_data1 is None)

        post_data2 = self.discussion_manager.create_post(discussion_id, ip2, blocks2)
        post_id2 = post_data2["_id"]
        post_data2 = self.discussion_manager.get_post(discussion_id, post_id2)
        self.assertFalse(post_data2 is None)

        posts_data = self.discussion_manager.get_posts(discussion_id)
        posts_id = [p["_id"] for p in posts_data]
        self.assertTrue(post_id1 in posts_id)
        self.assertTrue(post_id2 in posts_id)

        blocks = blocks1 + blocks2
        blocks_data = self.discussion_manager.get_blocks(discussion_id)
        blocks_body = [b["body"] for b in blocks_data]
        self.assertEqual(set(blocks), set(blocks_body))
        for b in post_data1["blocks"]:
            block_data = self.discussion_manager.get_block(discussion_id, b)
            self.assertTrue(block_data["body"] in blocks)

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

    def test_tag_post(self):
        ip1 = "12345"
        ip2 = "67890"
        user_manager.create(ip1)
        user_manager.create(ip2)
        discussion_data = self.discussion_manager.create()
        discussion_id = discussion_data["_id"]
        self.discussion_manager.join(discussion_id, ip1)
        self.discussion_manager.join(discussion_id, ip2)

        blocks = ["im a post"]
        post_data1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
        post_id = post_data1["_id"]
        tag = "imatag"
        self.discussion_manager.post_add_tag(discussion_id, ip1, post_id, tag)
        post_data = self.discussion_manager.get_post(discussion_id, post_id)
        self.assertTrue(tag in post_data["tags"])

        self.discussion_manager.post_remove_tag(discussion_id, ip1, post_id, tag)
        post_data = self.discussion_manager.get_post(discussion_id, post_id)
        self.assertFalse(tag in post_data["tags"])

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

    def test_tag_block(self):
        ip1 = "12345"
        ip2 = "67890"
        user_manager.create(ip1)
        user_manager.create(ip2)
        discussion_data = self.discussion_manager.create()
        discussion_id = discussion_data["_id"]
        self.discussion_manager.join(discussion_id, ip1)
        self.discussion_manager.join(discussion_id, ip2)

        blocks = ["im a post"]
        post_data1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
        block_id = post_data1["blocks"][0]
        tag = "imatag"
        self.discussion_manager.block_add_tag(discussion_id, ip1, block_id, tag)
        block_data = self.discussion_manager.get_block(discussion_id, block_id)
        self.assertTrue(tag in block_data["tags"])

        self.discussion_manager.block_remove_tag(discussion_id, ip1, block_id, tag)
        block_data = self.discussion_manager.get_block(discussion_id, block_id)
        self.assertFalse(tag in block_data["tags"])

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

    def test_search(self):
        #self.discussion_manager.discussion_scope_search(self, discussion_id, query)
        pass


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("DiscussionManagerTest").setLevel(logging.DEBUG)
    unittest.main()

