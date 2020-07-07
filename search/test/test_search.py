import logging
import sys
import unittest

from search.basic_search import basic_search
from search.tag_search import tag_search
from utils.utils import make_freq_dict 


class SearchTest(unittest.TestCase):

    def setUp(self):
        pass

    def test_basic_search(self):
        query = "good whales"
        blocks_data = [
            {
                "_id": "1",
                "freq_dict": make_freq_dict(
                    "whales whales whales whales"
                    + " good good"
                    + " bad"
                    + " the the the"
                    + " nice nice"
                    + " he"
                ),
                "created_at": "2020-05-06T00:00:00Z" 
            },         
            {
                "_id": "2",
                "freq_dict": make_freq_dict(
                    "whales whales whales whales"
                    + " good good"
                    + " bad"
                    + " the the the"
                    + " nice nice"
                    + " he"
                ),
                "created_at": "2020-05-01T00:00:00Z" 
            },         
            {
                "_id": "3",
                "freq_dict": make_freq_dict(
                    "whales whales whales whales"
                    + " good good"
                    + " bad"
                    + " the the the"
                    + " nice nice"
                    + " he"
                ),
                "created_at": "2020-05-08T00:00:00Z" 
            },         
            {
                "_id": "4",
                "freq_dict": make_freq_dict(
                    "whales whales whales whales whales whales whales whales"
                    + " the the the"
                ),
                "created_at": "2020-05-07T00:00:00Z" 
            },         
            {
                "_id": "5",
                "freq_dict": make_freq_dict(
                    "oranges oranges oranges"
                    + " friends friends"
                ),
                "created_at": "2020-05-06T00:00:00Z" 
            },         
            {
                "_id": "6",
                "freq_dict": make_freq_dict(
                    "whale whale whale whale whale whale"
                    + " the the"
                    + " good good"
                ),
                "created_at": "2020-05-06T00:00:00Z" 
            },         
        ]
        posts_data = blocks_data 
        results = basic_search(query, blocks_data, posts_data)
        blocks_results = results["blocks"]
        posts_results = results["posts"]
        self.assertEqual(blocks_results, posts_results)
        self.assertEqual(blocks_results, ["6", "3", "1", "2", "4"])

    def test_tag_search(self):
        tags = ["good", "whales"]
        blocks_data = [
            {
                "_id": "1",
                "tags": {
                    "whales": 0,
                    "good": 0,
                    "bad": 0,
                    "nice": 0,
                },
                "created_at": "2020-05-06T00:00:00Z" 
            },         
            {
                "_id": "2",
                "tags": {
                    "whales": 0,
                    "good": 0,
                    "bad": 0,
                    "nice": 0,
                },
                "created_at": "2020-05-01T00:00:00Z" 
            },         
            {
                "_id": "3",
                "tags": {
                    "whales": 0,
                    "good": 0,
                    "bad": 0,
                    "nice": 0,
                },
                "created_at": "2020-05-08T00:00:00Z" 
            },         
            {
                "_id": "4",
                "tags": {
                    "whales": 0,
                    "lovely": 0,
                },
                "created_at": "2020-05-07T00:00:00Z" 
            },         
            {
                "_id": "5",
                "tags": {
                    "oranges": 0,
                    "friends": 0,
                },
                "created_at": "2020-05-06T00:00:00Z" 
            },         
        ]
        posts_data = blocks_data 
        results = tag_search(tags, blocks_data, posts_data)
        blocks_results = results["blocks"]
        posts_results = results["posts"]
        self.assertEqual(blocks_results, posts_results)
        self.assertEqual(blocks_results, ["3", "1", "2", "4"])

if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("SearchTest").setLevel(logging.DEBUG)
    unittest.main()


