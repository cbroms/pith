import unittest

import sys
sys.path.append('.')
import utils


class TestDatabaseKeyword(unittest.TestCase):
    def setUp(self):
        pass

def test_get_posts(self):
    get_posts()

def test_get_discussion_posts(self):
    get_discussion_posts(discussion_id)

def test_get_user_saved_posts(self):
    get_user_saved_posts(user_id)

def test_get_post(self):
    get_post(post_id)

def test_insert_post(self):
    insert_post(post_obj)

def test_save_post(self):
    save_post(post_id, user_id)

def test_post_add_tag(self):
    post_add_tag(post_id, tag)

def test_post_remove_tag(self):
    post_remove_tag(post_id, tag)

if __name__ == "__main__":
    unittest.main()
