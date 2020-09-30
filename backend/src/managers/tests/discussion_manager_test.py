import asyncio
import logging
import time
import unittest

from managers.global_manager import GlobalManager


class DiscussionManagerTest(unittest.TestCase):

    def setUp(self) -> None:
        gm = GlobalManager()
        gm.start()
        self.discussion_manager = gm.discussion_manager

    def test_(self) -> None:
        pass

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
