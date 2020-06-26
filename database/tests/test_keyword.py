import unittest

import sys
sys.path.append('.')
import utils


class TestDatabaseKeyword(unittest.TestCase):
    def setUp(self):
        pass

    def test_get_keyword_blocks(self):
        get_keyword_blocks(keyword)

    def test_add_keyword_block(self):
        add_keyword_block(keyword, block_id, freq)

    def test_index_block(self):
        test_index_block(block_id, freq_dict)

    def test_get_keyword_posts(self):
        get_keyword_posts(keyword)

    def test_add_keyword_post(self):
        add_keyword_post(keyword, post_id, freq)

    def test_index_post(self):
        index_post(post_id, freq_dict)


if __name__ == "__main__":
    unittest.main()
