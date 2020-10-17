import asyncio
import logging
import time
import unittest

import error
from managers.global_manager import GlobalManager
from managers.discussion_manager import DiscussionManager

from models.discussion import (
  Discussion,
	Unit
)


def nothing(self, **kwargs):
  return None 


class DiscussionManagerTest(unittest.TestCase):

    def setUp(self) -> None:
        gm = GlobalManager()
        gm.start()

        # restart mongo collections!
        Discussion.objects().delete()
        Unit.objects().delete()

        self.discussion_manager = gm.discussion_manager
        self.board_manager = gm.board_manager
        self.log = logging.getLogger("DiscussionManagerTest")

    def test__check_discussion_id(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_discussion_id(nothing)
        res1 = checker(self.discussion_manager, discussion_id=discussion_id)
        res2 = checker(self.discussion_manager, discussion_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2["error"], error.BAD_DISCUSSION_ID)

    def test__check_unit_id(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_unit_id(nothing)
        discussion = self.discussion_manager._get(discussion_id).get()
        res1 = checker(self.discussion_manager, unit_id=discussion.document)
        res2 = checker(self.discussion_manager, unit_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2["error"], error.BAD_UNIT_ID)

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
        self.assertEqual(res2["error"], error.BAD_USER_ID)

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

    def test_locking(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id1 = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id1)
      
        nickname = "monkeys"
        user_id2 = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id2)

        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="yaddi", parent=root, previous=root, position=0
        )
        unit_id = added["unit_id"]

        #### edit lock ####
        
        # can request if no one has lock
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res["unit_id"], unit_id) # works
        # cannot request if another has it
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res["error"], error.FAILED_EDIT_ACQUIRE) # fails
        # cannot re-request
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res["error"], error.FAILED_EDIT_ACQUIRE) # fails

        # hide that doesn't work
        res = self.discussion_manager.hide_unit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id)
        self.assertEqual(res["error"], error.BAD_EDIT_TRY)
        # lock is not released 
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res["error"], error.FAILED_EDIT_ACQUIRE) # fails
        # hide that works
        res = self.discussion_manager.hide_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id)
        self.assertEqual(res["unit_id"], unit_id)

        # lock is released 
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res["unit_id"], unit_id) # works

        # edit that doesn't work
        res = self.discussion_manager.edit_unit(
          discussion_id=discussion_id, user_id=user_id1, 
          unit_id=unit_id, pith="blahblah"
        )
        self.assertEqual(res["error"], error.BAD_EDIT_TRY)
        # lock is not released 
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res["error"], error.FAILED_EDIT_ACQUIRE) # fails
        # edit that works
        edited, ab, rb = self.discussion_manager.edit_unit(
          discussion_id=discussion_id, user_id=user_id2, 
          unit_id=unit_id, pith="blahblah"
        )
        self.assertEqual(edited["unit_id"], unit_id)

        # lock is released 
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res["unit_id"], unit_id) # works
        # edit lock is held, and this makes no difference to position lock...
        
        #### position lock ####

        # can request if no one has lock
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res["unit_id"], unit_id) # works
        # cannot request if another has it
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res["error"], error.FAILED_POSITION_ACQUIRE) # fails
        # cannot re-request
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res["error"], error.FAILED_POSITION_ACQUIRE) # fails

        # move that doesn't work
        res = self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id2, units=[unit_id])
        self.assertEqual(res["error"], error.BAD_POSITION_TRY)
        # lock not released
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res["error"], error.FAILED_POSITION_ACQUIRE) # fails
        # move that works
        res = self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id1, units=[unit_id])
        self.assertEqual(res[0]["unit_id"], unit_id)

        # now can request lock
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res["unit_id"], unit_id) # works

        # merge that doesn't work
        res = self.discussion_manager.merge_units(
          discussion_id=discussion_id, user_id=user_id1, units=[unit_id])
        self.assertEqual(res["error"], error.BAD_POSITION_TRY)
        # lock not released
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res["error"], error.FAILED_POSITION_ACQUIRE) # fails
        # merge that works
        repos, added = self.discussion_manager.merge_units(
          discussion_id=discussion_id, user_id=user_id2, units=[unit_id])
        self.assertEqual(repos[0]["unit_id"], unit_id)
        self.assertEqual(added["pith"], "")

        # now can request lock
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res["unit_id"], unit_id) # works

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id1)
        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id2)

    def test_search(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document
        nickname = "monkeys"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="Monkeys are the best. Whales are the worst.", 
          parent=root, previous=root, position=0
        )
        unit_id1 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="I really like monkeys.", parent=root, previous=root, position=0
        )
        unit_id2 = added["unit_id"]

        res = self.discussion_manager.search(
          discussion_id=discussion_id, query="monkey"
        )
        self.assertEqual(len(res["chat_units"]), 0)
        self.assertEqual(len(res["doc_units"]), 2)
        res = self.discussion_manager.search(
          discussion_id=discussion_id, query="whale"
        )
        self.assertEqual(len(res["chat_units"]), 0)
        self.assertEqual(len(res["doc_units"]), 1)
        res = self.discussion_manager.search(
          discussion_id=discussion_id, query="whale monkey"
        )
        self.assertEqual(len(res["chat_units"]), 0)
        self.assertEqual(len(res["doc_units"]), 2)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_get_methods(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document
        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)["nickname"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="yaddi", parent=root, previous=root, position=0
        )
        unit_id = added["unit_id"]

        res = self.discussion_manager.load_user(discussion_id=discussion_id,
          user_id=user_id)
        self.assertFalse(res is None)
        res = self.discussion_manager.get_unit_page(discussion_id=discussion_id,
          user_id=user_id, unit_id=unit_id)
        self.assertFalse(res is None)
        res = self.discussion_manager.get_unit_context(discussion_id=discussion_id,
          unit_id=unit_id)
        self.assertFalse(res is None)
        res = self.discussion_manager.get_unit_content(discussion_id=discussion_id,
          unit_id=unit_id)
        self.assertFalse(res is None)
        res = self.discussion_manager.get_ancestors(discussion_id=discussion_id,
          unit_id=unit_id)
        self.assertFalse(res is None)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_unit_creation(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)["nickname"]

        # adding
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="yaddi", parent=root, previous=root, position=0
        )
        unit_id = added["unit_id"]
        # posting
        res, back = self.discussion_manager.post(discussion_id=discussion_id, 
          user_id=user_id, pith="blahblah")
        unit_id = res["unit_id"]
        # send to doc
        res, back = self.discussion_manager.send_to_doc(discussion_id=discussion_id,
          user_id=user_id, unit_id=unit_id)        
        unit_id = res["unit_id"]

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_timeline(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        res = self.discussion_manager.load_user(
          discussion_id=discussion_id, user_id=user_id
        )
        self.assertEqual(len(res["timeline"]), 0)

        # make tree of units
        
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, previous=root, position=0
        )
        unit_id1 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, previous=root, position=0
        )
        unit_id2 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, previous=root, position=0
        )
        unit_id3 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=unit_id1, previous=root, position=0
        )
        unit_id4 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=unit_id1, previous=root, position=0
        )
        unit_id5 = added["unit_id"]
        
        timeline = []

        res = self.discussion_manager.get_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id1
        )
        timeline.append(res["timeline_entry"])
        time.sleep(1)
        res = self.discussion_manager.get_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4
        )
        timeline.append(res["timeline_entry"])
        time.sleep(1)
        res = self.discussion_manager.get_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id3
        )
        timeline.append(res["timeline_entry"])
        time.sleep(1)
        res = self.discussion_manager.get_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        timeline.append(res["timeline_entry"])
        time.sleep(2)
        res = self.discussion_manager.get_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id5
        )
        timeline.append(res["timeline_entry"])
        time.sleep(1)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)
        res = self.discussion_manager.load_user(
          discussion_id=discussion_id, user_id=user_id
        )
        self.assertEqual(res["timeline"][:-1], timeline) # don't include most recently made (from leave)
        self.assertEqual(res["timeline"][-1]["unit_id"], unit_id5) # we got last one
        self.assertEqual(res["current_unit"], unit_id5)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_cursor_move(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)
      
        # make tree of units
        """
        1 -> [4, 5]
        2
        3
        """
        
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, previous=root, position=0
        )
        unit_id1 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, previous=root, position=0
        )
        unit_id2 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, previous=root, position=0
        )
        unit_id3 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=unit_id1, previous=root, position=0
        )
        unit_id4 = added["unit_id"]
        added, backlinks = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=unit_id1, previous=root, position=0
        )
        unit_id5 = added["unit_id"]
        
        res = self.discussion_manager.get_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id5
        )
        self.assertEqual(res["cursor"].unit_id, unit_id5)
        self.assertEqual(res["cursor"].position, -1)

        # select units to move
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id3
        )
        # perform the move
        """
        1 -> [4, 5 -> [2, 3]]
        """
        res = self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id, units=[unit_id2, unit_id3]
        )
        self.assertEqual(len(res), 2)

        self.discussion_manager.move_cursor(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id3, position=0
        )

        # select units to move
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4
        )
        """
        1 -> [5 -> [3 -> 6 -> [2, 4]]]
        """
        moved, added = self.discussion_manager.merge_units(
          discussion_id=discussion_id, user_id=user_id, units=[unit_id2, unit_id4]
        )
        unit_id6 = added["unit_id"]
        self.assertEqual(len(moved), 2)

        # now do an illegal move
        res = self.discussion_manager.get_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4
        )
        # select units to move
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id5
        )
        res = self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id, units=[unit_id2, unit_id5]
        )
        self.assertEqual(res["error"], error.BAD_PARENT)
        # lock is not released, so let's do a legal move
        """
        1 -> [7 -> [2, 5 -> [3 -> 6 -> [4]]]]
        """
        res = self.discussion_manager.get_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id1
        )
        moved, added = self.discussion_manager.merge_units(
          discussion_id=discussion_id, user_id=user_id, units=[unit_id2, unit_id5]
        )
        unit_id7 = added["unit_id"]

        # do a move flatten 
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id7
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id5
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id3
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id6
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4
        )
        res = self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id, units=[
            unit_id2, unit_id3, unit_id4, unit_id5, unit_id6, unit_id7
          ]
        )
        self.assertTrue(len(res), 6)
        self.discussion_manager.move_cursor(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id7, position=1
        )

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)
        res = self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        # we are where we left off
        self.assertEqual(res["cursor"].unit_id, unit_id7)
        self.assertEqual(res["cursor"].position, 1)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

"""
- get unit_ids from pith
- how edit/add/post/send_to_doc changes refs
- hide/unhide unit with state
- might want to do a backlink/forward link invariance check
- might want to do a tree invariance check?
"""

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
