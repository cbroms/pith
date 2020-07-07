import logging
import sys
import unittest
import uuid

from models.user_manager import UserManager
from models.user import User
from models.post import Post
from models.block import Block


class UserManagerTest(unittest.TestCase):

    def setUp(self):
        from pymongo import MongoClient 
        client = MongoClient('mongodb://localhost:27017')
        db = client["db"]
        self.user_manager = UserManager(db)
        self.log = logging.getLogger("UserManagerTest")

    def test_create_get(self):
        ip = "12345"
        self.user_manager.create(ip)
        user_data = self.user_manager.get(ip)
        self.assertEqual(user_data["_id"], ip)
        users_data = self.user_manager.get_all()
        user_ips = [u["_id"] for u in users_data]
        self.assertTrue(ip in user_ips)

        # repeat creation and see if idempotent
        self.user_manager.create(ip)
        user_data = self.user_manager.get(ip)
        self.assertEqual(user_data["_id"], ip)
        users_data = self.user_manager.get_all()
        user_ips = [u["_id"] for u in users_data]
        self.assertTrue(ip in user_ips)

    def test_in_discussion(self):
        ip = "12345"
        discussion_id = "in_discussion" + str(uuid.uuid4().hex)
        self.user_manager.create(ip)

        # joining
        self.user_manager.join_discussion(ip, discussion_id)
        user_data = self.user_manager.get(ip)
        self.assertTrue(discussion_id in user_data["discussions"])
        self.assertTrue(user_data["discussions"][discussion_id]["active"])

        # posting
        post_obj1 = Post(ip)
        post_id1 = post_obj1._id
        self.user_manager.insert_post_user_history(ip, discussion_id, post_id1)
        user_data = self.user_manager.get(ip)
        self.assertTrue(
            user_data["discussions"][discussion_id]["history"] \
                == [post_id1]
        )        
        post_obj2 = Post(ip)
        post_id2 = post_obj2._id
        self.user_manager.insert_post_user_history(ip, discussion_id, post_id2)
        user_data = self.user_manager.get(ip)
        self.assertTrue(
            user_data["discussions"][discussion_id]["history"] \
                == [post_id1, post_id2]
        )        

        # leaving
        self.user_manager.leave_discussion(ip, discussion_id)
        user_data = self.user_manager.get(ip)
        # still keep discussion in those that we visited
        self.assertTrue(discussion_id in user_data["discussions"])
        self.assertFalse(user_data["discussions"][discussion_id]["active"])

    def test_saving_post(self):
        ip = "12345"
        ip2 = "67890"
        discussion_id = "saving_post" + str(uuid.uuid4().hex)
        self.user_manager.create(ip)
        self.user_manager.join_discussion(ip, discussion_id)

        post_obj = Post(ip2)
        post_id = post_obj._id
        self.user_manager.save_post(ip, discussion_id, post_id)
        post_ids = self.user_manager.get_user_saved_posts(ip, discussion_id)
        self.assertTrue(post_id in post_ids)
        self.user_manager.unsave_post(ip, discussion_id, post_id)
        post_ids = self.user_manager.get_user_saved_posts(ip, discussion_id)
        self.assertFalse(post_id in post_ids)

        self.user_manager.leave_discussion(ip, discussion_id)

    def test_saving_block(self):
        ip = "12345"
        ip2 = "67890"
        discussion_id = "saving_block" + str(uuid.uuid4().hex)
        self.user_manager.create(ip)
        self.user_manager.join_discussion(ip, discussion_id)

        post_obj = Post(ip2)
        block_obj = Block(ip2, post_obj._id, "test")
        block_id = block_obj._id
        self.user_manager.save_block(ip, discussion_id, block_id)
        block_ids = self.user_manager.get_user_saved_blocks(ip, discussion_id)
        self.assertTrue(block_id in block_ids)
        self.user_manager.unsave_block(ip, discussion_id, block_id)
        block_ids = self.user_manager.get_user_saved_blocks(ip, discussion_id)
        self.assertFalse(block_id in block_ids)

        self.user_manager.leave_discussion(ip, discussion_id)

    def test_search(self):
        # for now just test manually
        #self.user_manager.user_saved_scope_search(user_id, discussion_id, query)
        pass


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("UserManagerTest").setLevel(logging.DEBUG)
    unittest.main()
