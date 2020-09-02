from datetime import datetime
import logging
import sys
import unittest

from constants import DATE_TIME_FMT
from models.discussion import (
    Block,
    Tag,
)
from search.basic_search import basic_search
from search.tag_search import tag_search
from utils.utils import make_freq_dict 


class SearchTest(unittest.TestCase):

    def setUp(self) -> None:
        pass

    def test_basic_search(self) -> None:
        query = "good whales"

        b1 = Block(body="whales whales whales whales"
          + " good good"
          + " bad"
          + " the the the"
          + " nice nice"
          + " he"
        )
        b1.id = "1"
        b1.created_at = datetime.strptime("2020-05-06T00:00:00Z", DATE_TIME_FMT) 
        b1.freq_dict = make_freq_dict(b1.body)

        b2 = Block(body="whales whales whales whales"
          + " good good"
          + " bad"
          + " the the the"
          + " nice nice"
          + " he"
        )
        b2.id = "2"
        b2.created_at = datetime.strptime("2020-05-01T00:00:00Z", DATE_TIME_FMT) 
        b2.freq_dict = make_freq_dict(b2.body)

        b3 = Block(body="whales whales whales whales"
          + " good good"
          + " bad"
          + " the the the"
          + " nice nice"
          + " he"
        )
        b3.id = "3"
        b3.created_at = datetime.strptime("2020-05-08T00:00:00Z", DATE_TIME_FMT) 
        b3.freq_dict = make_freq_dict(b3.body)

        b4 = Block(body="whales whales whales whales whales whales whales whales"
          + " the the the"
        )
        b4.id = "4"
        b4.created_at = datetime.strptime("2020-05-07T00:00:00Z", DATE_TIME_FMT) 
        b4.freq_dict = make_freq_dict(b4.body)

        b5 = Block(body="oranges oranges oranges"
          + " friends friends"
        )
        b5.id = "5"
        b5.created_at = datetime.strptime("2020-05-06T00:00:00Z", DATE_TIME_FMT) 
        b5.freq_dict = make_freq_dict(b5.body)

        b6 = Block(body="whale whale whale whale whale whale"
          + " the the"
          + " good good"
        )
        b6.id = "6"
        b6.created_at = datetime.strptime("2020-05-06T00:00:00Z", DATE_TIME_FMT) 
        b6.freq_dict = make_freq_dict(b6.body)

        results = basic_search(query, [b1, b2, b3, b4, b5, b6])
        self.assertEqual(results, ["6", "3", "1", "2", "4"])

    def test_tag_search(self) -> None:
        tags = ["good", "whales"]

        b1 = Block(body="")
        b1.id = "1"
        b1.created_at = datetime.strptime("2020-05-06T00:00:00Z", DATE_TIME_FMT)
        b1.tags = [Tag(tag=t) for t in ["whales", "good", "bad", "nice"]] 

        b2 = Block(body="")
        b2.id = "2"
        b2.created_at = datetime.strptime("2020-05-01T00:00:00Z", DATE_TIME_FMT)
        b2.tags = [Tag(tag=t) for t in ["whales", "good", "bad", "nice"]]

        b3 = Block(body="")
        b3.id = "3"
        b3.created_at = datetime.strptime("2020-05-08T00:00:00Z", DATE_TIME_FMT)
        b3.tags = [Tag(tag=t) for t in ["whales", "good", "bad", "nice"]] 

        b4 = Block(body="")
        b4.id = "4"
        b4.created_at = datetime.strptime("2020-05-07T00:00:00Z", DATE_TIME_FMT)
        b4.tags = [Tag(tag=t) for t in ["whales", "lovely"]]

        b5 = Block(body="")
        b5.id = "5"
        b5.created_at = datetime.strptime("2020-05-06T00:00:00Z", DATE_TIME_FMT)
        b5.tags = [Tag(tag=t) for t in ["oranges", "friends"]] 

        results = tag_search(tags, [b1, b2, b3, b4, b5])
        self.assertEqual(results, ["3", "1", "2", "4"])

if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("SearchTest").setLevel(logging.DEBUG)
    unittest.main()
