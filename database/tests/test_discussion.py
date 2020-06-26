import unittest

import sys
sys.path.append('.')
import utils


class TestDatabaseKeyword(unittest.TestCase):
    def setUp(self):
        pass

    def test_get_discussions(self):
        get_discussions()

    def test_get_user_saved_discussions(self):
        get_user_saved_discussions(user_id)

    def test_get_discussion(self):
        get_discussion(discussion_id)

    def test_save_discussion(self):
        save_discussion(discussion_id, user_id)

    def test_insert_discussion(self):
        insert_discussion(discussion_obj)

    def test_insert_post_discussion_history(self):
        insert_post_discussion_history(discussion_id, post_id)

    def test_insert_block_discussion_history(self):
        insert_block_discussion_history(discussion_id, block_id)

    def test_discussion_add_tag(self):
        discussion_add_tag(discussion_id, tag)

    def test_discussion_remove_tag(self):
        discussion_remove_tag(discussion_id, tag)

    def test_join_discussion(self): 
        join_discussion(discussion_id, user_id) 

    def test_leave_discussion(self): 
        leave_discussion(discussion_id, user_id) 


if __name__ == "__main__":
    unittest.main()
