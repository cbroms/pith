import asyncio
import logging
import time
import unittest

import error
from managers.global_manager import GlobalManager
from managers.discussion_manager import DiscussionManager


def nothing(**kwargs):
  return None 


class DiscussionManagerTest(unittest.TestCase):

    def setUp(self) -> None:
        gm = GlobalManager()
        gm.start()
        self.discussion_manager = gm.discussion_manager
        self.board_manager = gm.board_manager
        self.log = logging.getLogger("DiscussionManagerTest")

    def test__check_discussion_id(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_discussion_id(nothing)
        res1 = checker(discussion_id=discussion_id)
        res2 = checker(discussion_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2, error.BAD_DISCUSSION_ID)

    def test__check_unit_id(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_unit("unit_id")(nothing)
        discussion = DiscussionManager._get(discussion_id).get()
        res1 = checker(unit_id=discussion.document)
        res2 = checker(unit_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2, error.BAD_UNIT_ID)

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
