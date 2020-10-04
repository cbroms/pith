import logging
import unittest
import uuid

from managers.global_manager import GlobalManager
from models.discussion import Discussion


class BoardManagerTest(unittest.TestCase):

    def setUp(self) -> None:
        gm = GlobalManager()
        gm.start()
        self.board_manager = gm.board_manager
        self.log = logging.getLogger("BoardManagerTest")

    def test_create(self) -> None:
        result = self.board_manager.create()
        discussion_id = result["discussion_id"]
        discussion = self.board_manager._get(discussion_id) 
        self.assertTrue(discussion.id, discussion_id)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
