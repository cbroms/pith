import asyncio
import logging
import time
import unittest

from error import Errors
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

    def test_extract_pith(self) -> None:
      res = self.discussion_manager._retrieve_links(
        "<cite>tears</cite> Something seems to be alright <cite>happy</cite>."
        " Everything is good <cite>fine</cite>."
      )
      self.assertEqual(res, ["tears", "happy", "fine"])

    def test__check_discussion_id(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_discussion_id(nothing)
        res1 = checker(self.discussion_manager, discussion_id=discussion_id)
        res2 = checker(self.discussion_manager, discussion_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2, Errors.BAD_DISCUSSION_ID)

    def test__check_unit_id(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_unit_id(nothing)
        discussion = self.discussion_manager._get(discussion_id).get()
        res1 = checker(self.discussion_manager, unit_id=discussion.document)
        res2 = checker(self.discussion_manager, unit_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2, Errors.BAD_UNIT_ID)

    def test_create_user(self) -> None:
        nickname = "whales"
        discussion_id = self.board_manager.create()["discussion_id"]
        checker = DiscussionManager._check_user_id(nothing)
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        res1 = checker(self.discussion_manager, 
          discussion_id=discussion_id, user_id=user_id)
        res2 = checker(self.discussion_manager, 
          discussion_id=discussion_id, user_id="...")
        self.assertTrue(res1 is None)
        self.assertEqual(res2, Errors.BAD_USER_ID)
        res = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)
        self.assertEqual(res, Errors.NICKNAME_EXISTS)
        res = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname="monkey", user_id=user_id)
        self.assertEqual(res, Errors.USER_ID_EXISTS)
        user_id2_ = "blahblah"
        user_id2 = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname="monkey", user_id=user_id2_)[0]["user_id"]
        self.assertEqual(user_id2, user_id2_)

    def test_join_leave(self) -> None: 
        nickname = "whales"
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        res = self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)[1][0]["nickname"]
        self.assertTrue(discussion.get().users.filter(id=user_id).get().active)
        self.assertTrue(res, nickname)
        res = self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)[1][0]["nickname"]
        self.assertFalse(discussion.get().users.filter(id=user_id).get().active)
        self.assertTrue(res, nickname)

    def test_locking(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id1 = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id1)
      
        nickname = "monkeys"
        user_id2 = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id2)

        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="yaddi", parent=root, position=0
        )[1][0]
        unit_id = added["unit_id"]

        #### edit lock ####
        
        # can request if no one has lock
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )[1][0]
        self.assertTrue(isinstance(res, list))
        # cannot request if another has it
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )   
        self.assertEqual(res, Errors.FAILED_EDIT_ACQUIRE) # fails
        # cannot re-request
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res, Errors.FAILED_EDIT_ACQUIRE) # fails

        # hide that doesn't work
        res = self.discussion_manager.hide_unit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id)
        self.assertEqual(res, Errors.BAD_EDIT_TRY)
        # lock is not released 
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res, Errors.FAILED_EDIT_ACQUIRE) # fails
        # hide that works
        res = self.discussion_manager.hide_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id)[1][0]
        self.assertTrue(isinstance(res, list))

        # lock is released 
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )[1][0]
        self.assertTrue(isinstance(res, list))

        # edit that doesn't work
        res = self.discussion_manager.edit_unit(
          discussion_id=discussion_id, user_id=user_id1, 
          unit_id=unit_id, pith="blahblah"
        )
        self.assertEqual(res, Errors.BAD_EDIT_TRY)
        # lock is not released 
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res, Errors.FAILED_EDIT_ACQUIRE) # fails
        # edit that works
        res = self.discussion_manager.edit_unit(
          discussion_id=discussion_id, user_id=user_id2, 
          unit_id=unit_id, pith="blahblah"
        )[1][0]
        self.assertTrue(isinstance(res, list))

        # lock is released 
        res = self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )[1][0]   
        self.assertTrue(isinstance(res, list)) # works
        # edit lock is held, and this makes no difference to position lock...
        
        #### position lock ####

        # can request if no one has lock
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )[1][0]
        self.assertTrue(isinstance(res, list))
        # cannot request if another has it
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res, Errors.FAILED_POSITION_ACQUIRE) # fails
        # cannot re-request
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res, Errors.FAILED_POSITION_ACQUIRE) # fails

        # move that doesn't work
        res = self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id2, units=[unit_id],
          parent=root, position=0)
        self.assertEqual(res, Errors.BAD_POSITION_TRY)
        # lock not released
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )        
        self.assertEqual(res, Errors.FAILED_POSITION_ACQUIRE) # fails
        # move that works
        res = self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id1, units=[unit_id],
          parent=root, position=0)[1][0]
        self.assertTrue(isinstance(res, list))

        # now can request lock
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )[1][0]
        self.assertTrue(isinstance(res, list))

        # merge that doesn't work
        res = self.discussion_manager.merge_units(
          discussion_id=discussion_id, user_id=user_id1, units=[unit_id],
          parent=root, position=0)
        self.assertEqual(res, Errors.BAD_POSITION_TRY)
        # lock not released
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id2, unit_id=unit_id
        )        
        self.assertEqual(res, Errors.FAILED_POSITION_ACQUIRE) # fails
        # merge that works
        res = self.discussion_manager.merge_units(
          discussion_id=discussion_id, user_id=user_id2, units=[unit_id],
          parent=root, position=0)[1][0]
        self.assertTrue(isinstance(res, dict))

        # now can request lock
        res = self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id1, unit_id=unit_id
        )[1][0]
        self.assertTrue(isinstance(res, list))

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
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="Monkeys are the best. Whales are the worst.", 
          parent=root, position=0
        )[1][0]
        unit_id1 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="I really like monkeys.", parent=root, position=0
        )[1][0]
        unit_id2 = added["unit_id"]

        res = self.discussion_manager.search(
          discussion_id=discussion_id, query="monkey"
        )[0]
        self.assertEqual(len(res["chat_units"]), 0)
        self.assertEqual(len(res["doc_units"]), 2)
        res = self.discussion_manager.search(
          discussion_id=discussion_id, query="whale"
        )[0]
        self.assertEqual(len(res["chat_units"]), 0)
        self.assertEqual(len(res["doc_units"]), 1)
        res = self.discussion_manager.search(
          discussion_id=discussion_id, query="whale monkey"
        )[0]
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
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        res = self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)[0]
        self.assertFalse(res is None)
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="yaddi", parent=root, position=0
        )[1][0]
        unit_id = added["unit_id"]

        res = self.discussion_manager.load_unit_page(discussion_id=discussion_id,
          user_id=user_id, unit_id=unit_id)[0]
        self.assertFalse(res is None)
        res = self.discussion_manager.get_unit_context(discussion_id=discussion_id,
          unit_id=unit_id)[0]
        self.assertFalse(res is None)
        res = self.discussion_manager.get_unit_content(discussion_id=discussion_id,
          unit_id=unit_id)[0]
        self.assertFalse(res is None)
        res = self.discussion_manager.get_ancestors(discussion_id=discussion_id,
          unit_id=unit_id)[0]
        self.assertFalse(res is None)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_unit_creation(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        # adding
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="yaddi", parent=root, position=0
        )[1][0]
        unit_id = added["unit_id"]
        # posting
        res = self.discussion_manager.post(discussion_id=discussion_id, 
          user_id=user_id, pith="blahblah")[1][0]
        unit_id = res["unit_id"]
        # send to doc
        res = self.discussion_manager.send_to_doc(discussion_id=discussion_id,
          user_id=user_id, unit_id=unit_id)[1][0]   
        unit_id = res["unit_id"]

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_timeline(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        res = self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)[0]
        self.assertEqual(len(res["timeline"]), 0)

        # make tree of units
        
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, position=0
        )[1][0]
        unit_id1 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, position=0
        )[1][0]
        unit_id2 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, position=0
        )[1][0]
        unit_id3 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=unit_id1, position=0
        )[1][0]
        unit_id4 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=unit_id1, position=0
        )[1][0]
        unit_id5 = added["unit_id"]
        
        timeline = []

        res = self.discussion_manager.load_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id1
        )[0]
        timeline.append(res["timeline_entry"])
        time.sleep(1)
        res = self.discussion_manager.load_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4
        )[0]
        timeline.append(res["timeline_entry"])
        time.sleep(1)
        res = self.discussion_manager.load_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id3
        )[0]
        timeline.append(res["timeline_entry"])
        time.sleep(1)
        res = self.discussion_manager.load_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )[0]
        timeline.append(res["timeline_entry"])
        time.sleep(2)
        res = self.discussion_manager.load_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id5
        )[0]
        timeline.append(res["timeline_entry"])
        time.sleep(1)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)
        res = self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)[0]
        self.assertEqual(res["timeline"][:-1], timeline) # don't include most recently made (from leave)
        self.assertEqual(res["timeline"][-1]["unit_id"], unit_id5) # we got last one
        self.assertEqual(res["current_unit"], unit_id5)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_move(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)
      
        # make tree of units
        """
        1 -> [4, 5]
        2
        3
        """
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, position=0
        )[1][0]
        unit_id1 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, position=0
        )[1][0]
        unit_id2 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, position=0
        )[1][0]
        unit_id3 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=unit_id1, position=0
        )[1][0]
        unit_id4 = added["unit_id"]
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=unit_id1, position=0
        )[1][0]
        unit_id5 = added["unit_id"]
        
        # check tree structure
        """
        1 -> [4, 5]
        2
        3
        """
        children_root = self.discussion_manager._get_unit(root).get().children
        parent1 = self.discussion_manager._get_unit(unit_id1).get().parent
        children1 = self.discussion_manager._get_unit(unit_id1).get().children
        parent2 = self.discussion_manager._get_unit(unit_id2).get().parent
        children2 = self.discussion_manager._get_unit(unit_id2).get().children
        parent3 = self.discussion_manager._get_unit(unit_id3).get().parent
        children3 = self.discussion_manager._get_unit(unit_id3).get().children
        parent4 = self.discussion_manager._get_unit(unit_id4).get().parent
        children4 = self.discussion_manager._get_unit(unit_id4).get().children
        parent5 = self.discussion_manager._get_unit(unit_id5).get().parent
        children5 = self.discussion_manager._get_unit(unit_id5).get().children

        self.assertEqual(children_root, [unit_id3, unit_id2, unit_id1])
        self.assertEqual(parent1, root)
        self.assertEqual(parent2, root)
        self.assertEqual(parent3, root)

        self.assertEqual(children1, [unit_id5, unit_id4])
        self.assertEqual(parent4, unit_id1)
        self.assertEqual(parent5, unit_id1)
        
        self.assertEqual(len(children2), 0)
        self.assertEqual(len(children3), 0)
        self.assertEqual(len(children4), 0)
        self.assertEqual(len(children5), 0)

        res = self.discussion_manager.load_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id5
        )[1][0]
        self.assertEqual(res["cursor"]["unit_id"], unit_id5)
        self.assertEqual(res["cursor"]["position"], -1)

        """
        1 -> [4, 5 -> [2, 3]]
        """
        # select units to move
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id3
        )
        # perform the move
        self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id, units=[unit_id2, unit_id3],
          parent = unit_id5, position = 0
        )
        # check tree structure
        """
        1 -> [4, 5 -> [2, 3]]
        """
        children_root = self.discussion_manager._get_unit(root).get().children
        parent1 = self.discussion_manager._get_unit(unit_id1).get().parent
        children1 = self.discussion_manager._get_unit(unit_id1).get().children
        parent2 = self.discussion_manager._get_unit(unit_id2).get().parent
        position2 = self.discussion_manager._get_position(parent2, unit_id2)
        children2 = self.discussion_manager._get_unit(unit_id2).get().children
        parent3 = self.discussion_manager._get_unit(unit_id3).get().parent
        position3 = self.discussion_manager._get_position(parent3, unit_id3)
        children3 = self.discussion_manager._get_unit(unit_id3).get().children
        parent4 = self.discussion_manager._get_unit(unit_id4).get().parent
        children4 = self.discussion_manager._get_unit(unit_id4).get().children
        parent5 = self.discussion_manager._get_unit(unit_id5).get().parent
        children5 = self.discussion_manager._get_unit(unit_id5).get().children

        self.assertEqual(children_root, [unit_id1])
        self.assertEqual(parent1, root)

        self.assertEqual(children1, [unit_id5, unit_id4])
        self.assertEqual(parent4, unit_id1)
        self.assertEqual(parent5, unit_id1)

        self.assertEqual(children5, [unit_id2, unit_id3])
        self.assertTrue(children5[position2] == unit_id2)
        self.assertTrue(children5[position3] == unit_id3)
        self.assertEqual(parent2, unit_id5)
        self.assertEqual(parent3, unit_id5)
        
        self.assertEqual(len(children2), 0)
        self.assertEqual(len(children3), 0)
        self.assertEqual(len(children4), 0)

        """
        1 -> [5 -> [3 -> [6 -> [2, 4]]]]
        """
        # select units to move
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4
        )

        # perform the merge
        added = self.discussion_manager.merge_units(
          discussion_id=discussion_id, user_id=user_id, units=[unit_id2, unit_id4],
          parent=unit_id3, position=0
        )[1][0]
        unit_id6 = added["unit_id"]
        # check tree structure
        """
        1 -> [5 -> [3 -> [6 -> [2, 4]]]]
        """
        children_root = self.discussion_manager._get_unit(root).get().children
        parent1 = self.discussion_manager._get_unit(unit_id1).get().parent
        children1 = self.discussion_manager._get_unit(unit_id1).get().children
        parent2 = self.discussion_manager._get_unit(unit_id2).get().parent
        position2 = self.discussion_manager._get_position(parent2, unit_id2)
        children2 = self.discussion_manager._get_unit(unit_id2).get().children
        parent3 = self.discussion_manager._get_unit(unit_id3).get().parent
        children3 = self.discussion_manager._get_unit(unit_id3).get().children
        parent4 = self.discussion_manager._get_unit(unit_id4).get().parent
        position4 = self.discussion_manager._get_position(parent4, unit_id4)
        children4 = self.discussion_manager._get_unit(unit_id4).get().children
        parent5 = self.discussion_manager._get_unit(unit_id5).get().parent
        children5 = self.discussion_manager._get_unit(unit_id5).get().children
        parent6 = self.discussion_manager._get_unit(unit_id6).get().parent
        children6 = self.discussion_manager._get_unit(unit_id6).get().children

        self.assertTrue(unit_id1 in children_root)
        self.assertEqual(parent1, root)

        self.assertEqual(children1, [unit_id5])
        self.assertEqual(parent5, unit_id1)

        self.assertEqual(children5, [unit_id3])
        self.assertEqual(parent3, unit_id5)
        
        self.assertEqual(children3, [unit_id6])
        self.assertEqual(parent6, unit_id3)

        self.assertEqual(children6, [unit_id2, unit_id4])
        self.assertTrue(children6[position2] == unit_id2)
        self.assertTrue(children6[position4] == unit_id4)
        self.assertEqual(parent2, unit_id6)
        self.assertEqual(parent4, unit_id6)

        self.assertEqual(len(children2), 0)
        self.assertEqual(len(children4), 0)

        self.discussion_manager.load_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4
        )

        """
        1 -> [7 -> [2, 5 -> [3 -> 6 -> [4]]]]
        """
        # select units to move
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        self.discussion_manager.select_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id5
        )
        # perform the illegal move
        res = self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id, units=[unit_id2, unit_id5],
          parent=unit_id4, position=0
        )
        self.assertEqual(res, Errors.BAD_PARENT)
        # perform the legal merge
        self.discussion_manager.load_unit_page(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id1
        )
        added = self.discussion_manager.merge_units(
          discussion_id=discussion_id, user_id=user_id, units=[unit_id2, unit_id5],
          parent=unit_id1, position=0
        )[1][0]
        unit_id7 = added["unit_id"]
        # check tree structure
        """
        1 -> [7 -> [2, 5 -> [3 -> 6 -> [4]]]]
        """
        children_root = self.discussion_manager._get_unit(root).get().children
        parent1 = self.discussion_manager._get_unit(unit_id1).get().parent
        children1 = self.discussion_manager._get_unit(unit_id1).get().children
        parent2 = self.discussion_manager._get_unit(unit_id2).get().parent
        position2 = self.discussion_manager._get_position(parent2, unit_id2)
        children2 = self.discussion_manager._get_unit(unit_id2).get().children
        parent3 = self.discussion_manager._get_unit(unit_id3).get().parent
        children3 = self.discussion_manager._get_unit(unit_id3).get().children
        parent4 = self.discussion_manager._get_unit(unit_id4).get().parent
        children4 = self.discussion_manager._get_unit(unit_id4).get().children
        parent5 = self.discussion_manager._get_unit(unit_id5).get().parent
        position5 = self.discussion_manager._get_position(parent5, unit_id5)
        children5 = self.discussion_manager._get_unit(unit_id5).get().children
        parent6 = self.discussion_manager._get_unit(unit_id6).get().parent
        children6 = self.discussion_manager._get_unit(unit_id6).get().children
        parent7 = self.discussion_manager._get_unit(unit_id7).get().parent
        children7 = self.discussion_manager._get_unit(unit_id7).get().children

        self.assertTrue(unit_id1 in children_root)
        self.assertEqual(parent1, root)

        self.assertEqual(children1, [unit_id7])
        self.assertEqual(parent7, unit_id1)

        self.assertEqual(children7, [unit_id2, unit_id5])
        self.assertTrue(children7[position2] == unit_id2)
        self.assertTrue(children7[position5] == unit_id5)
        self.assertEqual(parent2, unit_id7)
        self.assertEqual(parent5, unit_id7)

        self.assertEqual(children5, [unit_id3])
        self.assertEqual(parent3, unit_id5)

        self.assertEqual(children3, [unit_id6])
        self.assertEqual(parent6, unit_id3)

        self.assertEqual(children6, [unit_id4])
        self.assertEqual(parent4, unit_id6)

        self.assertEqual(len(children2), 0)
        self.assertEqual(len(children4), 0)

        """
        1 -> [2, 3, 4, 5, 6, 7]
        """
        # select units to move
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
        # do a move flatten 
        self.discussion_manager.move_units(
          discussion_id=discussion_id, user_id=user_id, units=[
            unit_id2, unit_id3, unit_id4, unit_id5, unit_id6, unit_id7
          ], parent=unit_id1, position=0
        )
        # check tree structure
        """
        1 -> [2, 3, 4, 5, 6, 7]
        """
        children_root = self.discussion_manager._get_unit(root).get().children
        parent1 = self.discussion_manager._get_unit(unit_id1).get().parent
        children1 = self.discussion_manager._get_unit(unit_id1).get().children
        parent2 = self.discussion_manager._get_unit(unit_id2).get().parent
        position2 = self.discussion_manager._get_position(parent2, unit_id2)
        children2 = self.discussion_manager._get_unit(unit_id2).get().children
        parent3 = self.discussion_manager._get_unit(unit_id3).get().parent
        position3 = self.discussion_manager._get_position(parent3, unit_id3)
        children3 = self.discussion_manager._get_unit(unit_id3).get().children
        parent4 = self.discussion_manager._get_unit(unit_id4).get().parent
        position4 = self.discussion_manager._get_position(parent4, unit_id4)
        children4 = self.discussion_manager._get_unit(unit_id4).get().children
        parent5 = self.discussion_manager._get_unit(unit_id5).get().parent
        position5 = self.discussion_manager._get_position(parent5, unit_id5)
        children5 = self.discussion_manager._get_unit(unit_id5).get().children
        parent6 = self.discussion_manager._get_unit(unit_id6).get().parent
        position6 = self.discussion_manager._get_position(parent6, unit_id6)
        children6 = self.discussion_manager._get_unit(unit_id6).get().children
        parent7 = self.discussion_manager._get_unit(unit_id7).get().parent
        position7 = self.discussion_manager._get_position(parent7, unit_id7)
        children7 = self.discussion_manager._get_unit(unit_id7).get().children

        self.assertTrue(unit_id1 in children_root)
        self.assertEqual(parent1, root)

        self.assertEqual(children1, 
          [unit_id2, unit_id3, unit_id4, unit_id5, unit_id6, unit_id7])
        self.assertTrue(children1[position2] == unit_id2)
        self.assertTrue(children1[position3] == unit_id3)
        self.assertTrue(children1[position4] == unit_id4)
        self.assertTrue(children1[position5] == unit_id5)
        self.assertTrue(children1[position6] == unit_id6)
        self.assertTrue(children1[position7] == unit_id7)

        self.assertEqual(len(children2), 0)
        self.assertEqual(len(children3), 0)
        self.assertEqual(len(children4), 0)
        self.assertEqual(len(children5), 0)
        self.assertEqual(len(children6), 0)
        self.assertEqual(len(children7), 0)

        self.discussion_manager.move_cursor(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id7, position=0
        )

        user = discussion.get().users.filter(id=user_id).get()
        self.assertEqual(user.cursor.unit_id, unit_id7)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

        user = discussion.get().users.filter(id=user_id).get()
        self.assertEqual(user.cursor.unit_id, unit_id7)

        res = self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)[1][0]

        # we are where we left off
        self.assertEqual(res["cursor"]["unit_id"], unit_id7)
        self.assertEqual(res["cursor"]["position"], 0)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_hiding(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "monkeys"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="Monkeys are the best. Whales are the worst.", 
          parent=root, position=0
        )[1][0]
        unit_id = added["unit_id"]

        self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id
        )        
        res = self.discussion_manager.hide_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id)[1][0]
        self.assertTrue(self.discussion_manager._get_unit(unit_id).get().hidden)

        res = self.discussion_manager.unhide_unit(
          discussion_id=discussion_id, unit_id=unit_id)[1][0]
        self.assertFalse(self.discussion_manager._get_unit(unit_id).get().hidden)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_network(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        """
        1
        """
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="", parent=root, position=0
        )[1][0]
        unit_id1 = added["unit_id"]

        forward1 = self.discussion_manager._get_unit(unit_id1).get().forward_links
        backward1 = self.discussion_manager._get_unit(unit_id1).get().backward_links

        self.assertEqual(len(forward1), 0)
        self.assertEqual(len(backward1), 0)

        """
        1
        2 -> 1
        """
        res = self.discussion_manager.add_unit(discussion_id=discussion_id, 
          pith="<cite>{}</cite>".format(unit_id1), parent=root, position=0)[1][0]
        unit_id2 = res["unit_id"]

        forward1 = self.discussion_manager._get_unit(unit_id1).get().forward_links
        backward1 = self.discussion_manager._get_unit(unit_id1).get().backward_links
        forward2 = self.discussion_manager._get_unit(unit_id2).get().forward_links
        backward2 = self.discussion_manager._get_unit(unit_id2).get().backward_links

        self.assertEqual(len(forward1), 0)
        self.assertEqual(len(backward1), 1)
        self.assertTrue(unit_id2 in backward1)

        self.assertEqual(len(forward2), 1)
        self.assertTrue(unit_id1 in forward2)
        self.assertEqual(len(backward2), 0)

        """
        1
        2 -> 1
        3 -> 1, 2
        """
        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="<cite>{}</cite> <cite>{}</cite>".format(unit_id1, unit_id2), 
          parent=root, position=0
        )[1][0]
        unit_id3 = added["unit_id"]
        
        forward1 = self.discussion_manager._get_unit(unit_id1).get().forward_links
        backward1 = self.discussion_manager._get_unit(unit_id1).get().backward_links
        forward2 = self.discussion_manager._get_unit(unit_id2).get().forward_links
        backward2 = self.discussion_manager._get_unit(unit_id2).get().backward_links
        forward3 = self.discussion_manager._get_unit(unit_id3).get().forward_links
        backward3 = self.discussion_manager._get_unit(unit_id3).get().backward_links

        self.assertEqual(len(forward1), 0)
        self.assertEqual(len(backward1), 2)
        self.assertTrue(unit_id2 in backward1)
        self.assertTrue(unit_id3 in backward1)

        self.assertEqual(len(forward2), 1)
        self.assertTrue(unit_id1 in forward2)
        self.assertEqual(len(backward2), 1)
        self.assertTrue(unit_id3 in backward2)

        self.assertEqual(len(forward3), 2)
        self.assertTrue(unit_id1 in forward3)
        self.assertTrue(unit_id2 in forward3)
        self.assertEqual(len(backward3), 0)

        """
        1
        2 -> 1
        3 -> 1, 2
        4(X -> 1)
        X -> 1
        """
        res = self.discussion_manager.post(discussion_id=discussion_id, 
          user_id=user_id, pith="<cite>{}</cite>".format(unit_id1))[1][0]
        unit_idx = res["unit_id"]
        res = self.discussion_manager.send_to_doc(discussion_id=discussion_id,
          user_id=user_id, unit_id=unit_idx)[1][0] 
        unit_id4 = res["unit_id"]

        forward1 = self.discussion_manager._get_unit(unit_id1).get().forward_links
        backward1 = self.discussion_manager._get_unit(unit_id1).get().backward_links
        forward2 = self.discussion_manager._get_unit(unit_id2).get().forward_links
        backward2 = self.discussion_manager._get_unit(unit_id2).get().backward_links
        forward3 = self.discussion_manager._get_unit(unit_id3).get().forward_links
        backward3 = self.discussion_manager._get_unit(unit_id3).get().backward_links
        forward4 = self.discussion_manager._get_unit(unit_id4).get().forward_links
        backward4 = self.discussion_manager._get_unit(unit_id4).get().backward_links
        source4 = self.discussion_manager._get_unit(unit_id4).get().source_unit_id

        self.assertEqual(source4, unit_idx)

        self.assertEqual(len(forward1), 0)
        self.assertEqual(len(backward1), 4)
        self.assertTrue(unit_id2 in backward1)
        self.assertTrue(unit_id3 in backward1)
        self.assertTrue(unit_id4 in backward1)
        self.assertTrue(unit_idx in backward1)

        self.assertEqual(len(forward2), 1)
        self.assertTrue(unit_id1 in forward2)
        self.assertEqual(len(backward2), 1)
        self.assertTrue(unit_id3 in backward2)

        self.assertEqual(len(forward3), 2)
        self.assertTrue(unit_id1 in forward3)
        self.assertTrue(unit_id2 in forward3)
        self.assertEqual(len(backward3), 0)

        self.assertEqual(len(forward4), 1)
        self.assertTrue(unit_id1 in forward4)
        self.assertEqual(len(backward4), 0) # is not directly backward-referenced

        """
        1
        2 -> 1
        3 -> 1, 2
        4 -> 2, 3
        X -> 1
        """
        self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4
        )        
        self.discussion_manager.edit_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id4,
          pith="<cite>{}</cite> <cite>{}</cite>".format(unit_id2, unit_id3)
        ) # now cites original post 

        forward1 = self.discussion_manager._get_unit(unit_id1).get().forward_links
        backward1 = self.discussion_manager._get_unit(unit_id1).get().backward_links
        forward2 = self.discussion_manager._get_unit(unit_id2).get().forward_links
        backward2 = self.discussion_manager._get_unit(unit_id2).get().backward_links
        forward3 = self.discussion_manager._get_unit(unit_id3).get().forward_links
        backward3 = self.discussion_manager._get_unit(unit_id3).get().backward_links
        forward4 = self.discussion_manager._get_unit(unit_id4).get().forward_links
        backward4 = self.discussion_manager._get_unit(unit_id4).get().backward_links
        source4 = self.discussion_manager._get_unit(unit_id4).get().source_unit_id

        self.assertEqual(source4, unit_idx)

        self.assertEqual(len(forward1), 0)
        self.assertEqual(len(backward1), 3)
        self.assertTrue(unit_id2 in backward1)
        self.assertTrue(unit_id3 in backward1)
        self.assertTrue(unit_idx in backward1)

        self.assertEqual(len(forward2), 1)
        self.assertTrue(unit_id1 in forward2)
        self.assertEqual(len(backward2), 2)
        self.assertTrue(unit_id3 in backward2)
        self.assertTrue(unit_id4 in backward2)

        self.assertEqual(len(forward3), 2)
        self.assertTrue(unit_id1 in forward3)
        self.assertTrue(unit_id2 in forward3)
        self.assertEqual(len(backward3), 1)
        self.assertTrue(unit_id4 in backward3)

        self.assertEqual(len(forward4), 2)
        self.assertTrue(unit_id2 in forward4)
        self.assertTrue(unit_id3 in forward4)
        self.assertEqual(len(backward4), 0)

        """
        1
        2 -> 1
        3 -> 2, 4
        4 -> 2, 3
        X -> 1
        """
        self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id3
        )        
        self.discussion_manager.edit_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id3,
          pith="<cite>{}</cite> <cite>{}</cite>".format(unit_id2, unit_id4)
        )        

        forward1 = self.discussion_manager._get_unit(unit_id1).get().forward_links
        backward1 = self.discussion_manager._get_unit(unit_id1).get().backward_links
        forward2 = self.discussion_manager._get_unit(unit_id2).get().forward_links
        backward2 = self.discussion_manager._get_unit(unit_id2).get().backward_links
        forward3 = self.discussion_manager._get_unit(unit_id3).get().forward_links
        backward3 = self.discussion_manager._get_unit(unit_id3).get().backward_links
        forward4 = self.discussion_manager._get_unit(unit_id4).get().forward_links
        backward4 = self.discussion_manager._get_unit(unit_id4).get().backward_links

        self.assertEqual(source4, unit_idx)

        self.assertEqual(len(forward1), 0)
        self.assertEqual(len(backward1), 2)
        self.assertTrue(unit_id2 in backward1)
        self.assertTrue(unit_idx in backward1)

        self.assertEqual(len(forward2), 1)
        self.assertTrue(unit_id1 in forward2)
        self.assertEqual(len(backward2), 2)
        self.assertTrue(unit_id3 in backward2)
        self.assertTrue(unit_id4 in backward2)

        self.assertEqual(len(forward3), 2)
        self.assertTrue(unit_id2 in forward3)
        self.assertTrue(unit_id4 in forward3)
        self.assertEqual(len(backward3), 1)
        self.assertTrue(unit_id4 in backward3)

        self.assertEqual(len(forward4), 2)
        self.assertTrue(unit_id2 in forward4)
        self.assertTrue(unit_id3 in forward4)
        self.assertEqual(len(backward4), 1)
        self.assertTrue(unit_id3 in backward4)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)

    def test_chat_references(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        res = self.discussion_manager.post(discussion_id=discussion_id, 
          user_id=user_id, pith="blahblah")[1][0]
        unit_id1 = res["unit_id"]

        res = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="referencing <cite>{}</cite>".format(unit_id1), parent=root, position=0
        )
        self.assertEqual(res, Errors.INVALID_REFERENCE)

        added = self.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith="referencing null", parent=root, position=1
        )[1][0]
        unit_id2 = added["unit_id"]

        self.discussion_manager.request_to_edit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2
        )
        res = self.discussion_manager.edit_unit(
          discussion_id=discussion_id, user_id=user_id, unit_id=unit_id2,
          pith="referencing <cite>{}</cite>".format(unit_id1)
        )
        self.assertEqual(res, Errors.INVALID_REFERENCE)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)
       
    def test_remove_chat_links(self) -> None:
        discussion_id = self.board_manager.create()["discussion_id"]
        discussion = self.discussion_manager._get(discussion_id)
        root = discussion.get().document

        nickname = "whales"
        user_id = self.discussion_manager.create_user(
          discussion_id=discussion_id, nickname=nickname)[0]["user_id"]
        self.discussion_manager.join(
          discussion_id=discussion_id, user_id=user_id)

        res = self.discussion_manager.post(discussion_id=discussion_id, 
          user_id=user_id, pith="blahblah")[1][0]
        unit_id1 = res["unit_id"]

        res = self.discussion_manager.post(discussion_id=discussion_id, 
          user_id=user_id, pith="yaddiyaddiyah")[1][0]
        unit_id2 = res["unit_id"]

        pith = "I am some text <cite>{}</cite> and more text <cite>{}</cite> and yet more text <cite>{}</cite>".format(unit_id1, unit_id2, unit_id1)
        new_pith = self.discussion_manager._remove_chat_links(pith)
        expected = "I am some text <cite></cite> and more text <cite></cite> and yet more text <cite></cite>"
        self.assertEqual(new_pith, expected)

        self.discussion_manager.leave(
          discussion_id=discussion_id, user_id=user_id)


if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    unittest.main()
