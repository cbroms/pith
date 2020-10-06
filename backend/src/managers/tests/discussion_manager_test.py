import asyncio
import logging
import time
import unittest

import error
from managers.global_manager import GlobalManager
from managers.discussion_manager import DiscussionManager


def nothing(self, **kwargs):
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
        res1 = checker(self.discussion_manager, discussion_id=discussion_id)
        res2 = checker(self.discussion_manager, discussion_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2, error.BAD_DISCUSSION_ID)

    def test__check_unit_id(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_unit_id(nothing)
        discussion = self.discussion_manager._get(discussion_id).get()
        res1 = checker(self.discussion_manager, unit_id=discussion.document)
        res2 = checker(self.discussion_manager, unit_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2, error.BAD_UNIT_ID)

    def test_create_user(self) -> None:
        nickname = "whales"
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_user_id(nothing)
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        res1 = checker(self.discussion_manager, 
          discussion_id=discussion_id, user_id=user_id)
        res2 = checker(self.discussion_manager, 
          discussion_id=discussion_id, user_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2, error.BAD_USER_ID)

    def test_join_leave(self) -> None: 
        nickname = "whales"
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        res = self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)["nickname"]
        self.assertTrue(discussion.get().users.filter(id=user_id).get().active)
        self.assertTrue(res, nickname)
        res = self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)["nickname"]
        self.assertFalse(discussion.get().users.filter(id=user_id).get().active)
        self.assertTrue(res, nickname)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
