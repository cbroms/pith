import unittest

import sys
sys.path.append('.')
import utils


class TestDatabaseKeyword(unittest.TestCase):
    def setUp(self):
        pass

    def test_get_users(self):
        get_users()

    def test_get_discussion_users(self):
        get_discussion_users(discussion_id)

    def test_get_user(self):
        get_user(user_id)

    def test_insert_user(self):
        insert_user(user_obj)

    def test_insert_post_user_history(self):
        insert_post_user_history(user_id, post_id)


if __name__ == "__main__":
    unittest.main()
