import logging
import unittest
import uuid

from managers.global_manager import GlobalManager


class UserManagerTest(unittest.TestCase):

    def setUp(self) -> None:
        gm = GlobalManager()
        gm.start()
        self.board_manager = gm.board_manager
        self.log = logging.getLogger("BoardManagerTest")

    def test_create_get(self) -> None:
        discussion_id = self.board_manager.create()
        self.assertFalse(discussion_id is None)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
