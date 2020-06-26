import unittest

import sys
sys.path.append('.')
import utils


class TestDatabaseKeyword(unittest.TestCase):
    def setUp(self):
        pass

def test_get_blocks(self):
    get_blocks()

def test_get_discussion_blocks(self):
    get_discussion_blocks(discussion_id)

def test_get_user_saved_blocks(self):
    get_user_saved_blocks(user_id)

def test_get_block(self):
    get_block(block_id)

def test_insert_block(self):
    insert_block(block_obj)

def test_save_block(self):
    save_block(block_id, user_id)

def test_unsave_block(self):
    unsave_block(block_id, user_id)

def test_block_add_tag(self):
    block_add_tag(block_id, tag)

def test_block_remove_tag(self):
    block_remove_tag(block_id, tag)


if __name__ == "__main__":
    unittest.main()
