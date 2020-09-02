import logging
import sys
import unittest
import uuid

from managers.global_manager import GlobalManager
from models.user import User
from models.discussion import (
  Block,
  Post,
)


class UserManagerTest(unittest.TestCase):

    def setUp(self):
        gm = GlobalManager()
        self.user_manager = gm.user_manager
        self.log = logging.getLogger("UserManagerTest")

    def test_create_get(self):
        ip = "12345"
        self.user_manager.create(ip)
        user_obj = self.user_manager.get(ip).get()
        self.assertEqual(user_obj.ip, ip)

        # repeat creation and see if idempotent
        self.user_manager.create(ip)
        user_obj = self.user_manager.get(ip).get()
        self.assertEqual(user_obj.ip, ip)

    def test_in_discussion(self):
        ip = "12345"
        discussion_id = "in_discussion" + str(uuid.uuid4().hex)
        name = "hello"
        self.user_manager.create(ip)

        # joining (only user-side)
        self.user_manager.join_discussion(ip, discussion_id, name)
        user_obj = self.user_manager.get(ip).get()
        self.assertTrue(self.user_manager._is_discussion_user(ip, discussion_id))
        self.assertTrue(user_obj.discussions.filter(discussion_id=discussion_id).get().active)

        # leaving (only user-side)
        self.user_manager.leave_discussion(ip, discussion_id)
        user_obj = self.user_manager.get(ip).get()
        # assume we still have discussion 
        self.assertFalse(user_obj.discussions.filter(discussion_id=discussion_id).get().active)

    def test_saving_post(self):
        ip = "12345"
        ip2 = "67890"
        name = "hello"
        discussion_id = "saving_post" + str(uuid.uuid4().hex)
        self.user_manager.create(ip)
        self.user_manager.join_discussion(ip, discussion_id, name)

        post_obj = Post(user=ip2)
        post_id = post_obj.id
        self.user_manager.save_post(ip, discussion_id, post_id)
        post_ids = self.user_manager.get_user_saved_post_ids(ip, discussion_id)
        self.assertTrue(post_id in post_ids)
        self.user_manager.unsave_post(ip, discussion_id, post_id)
        post_ids = self.user_manager.get_user_saved_post_ids(ip, discussion_id)
        self.assertFalse(post_id in post_ids)

        self.user_manager.leave_discussion(ip, discussion_id)

    def test_saving_block(self):
        ip = "12345"
        ip2 = "67890"
        name = "hello"
        discussion_id = "saving_block" + str(uuid.uuid4().hex)
        self.user_manager.create(ip)
        self.user_manager.join_discussion(ip, discussion_id, name)

        post_obj = Post(user=ip2)
        block_obj = Block(body="test", user=ip2, post=post_obj.id)
        block_id = block_obj.id
        self.user_manager.save_block(ip, discussion_id, block_id)
        block_ids = self.user_manager.get_user_saved_block_ids(ip, discussion_id)
        self.assertTrue(block_id in block_ids)
        self.user_manager.unsave_block(ip, discussion_id, block_id)
        block_ids = self.user_manager.get_user_saved_block_ids(ip, discussion_id)
        self.assertFalse(block_id in block_ids)

        self.user_manager.leave_discussion(ip, discussion_id)


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("UserManagerTest").setLevel(logging.DEBUG)
    unittest.main()
