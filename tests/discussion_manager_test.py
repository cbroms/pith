import logging
import sys
import time
import unittest
import asyncio
import uuid

from models.global_manager import GlobalManager


async def create(self, *args, **kwargs):
    return await self.discussion_manager.create(*args, **kwargs)


class DiscussionManagerTest(unittest.TestCase):

    def setUp(self):
        self.log = logging.getLogger("DiscussionManagerTest")
        global_manager = GlobalManager()
        self.discussion_manager = global_manager.discussion_manager
        self.user_manager = global_manager.user_manager

    def test_create_get(self):
        title = "fake_title"
        theme = "fake_theme"
        time_limit = 5
        discussion_id = asyncio.run(create(self, title, theme)) #, time_limit))
        #discussion_ids = self.discussion_manager.get_all()
        #self.assertTrue(discussion_id in discussion_ids)
        discussion_obj = self.discussion_manager.get(discussion_id)
        self.assertFalse(discussion_obj is None)
        self.assertTrue(discussion_obj.expire_at is not None)
        self.assertFalse(discussion_obj.expired)
        #time.sleep(time_limit + 1)
        #discussion_obj = self.discussion_manager.get(discussion_id)
        #self.assertTrue(discussion_obj.expired)

    def test_join_leave(self):
        ip = "12345"
        ip2 = "67890"
        name = "hello"
        name2 = "goodbye"
        title = "fake_title"
        theme = "fake_theme"
        self.user_manager.create(ip)
        self.user_manager.create(ip2)
        discussion_id = asyncio.run(create(self, title, theme))

        # test joining
        info = self.discussion_manager.join(discussion_id, ip, name)
        self.assertTrue("discussion_id" in info)
        self.assertTrue("title" in info)
        self.assertTrue("theme" in info)
        self.assertTrue("num_users" in info)
        self.assertEqual(info["discussion_id"], discussion_id)
        self.assertEqual(info["title"], title)
        self.assertEqual(info["theme"], theme)
        self.assertEqual(info["num_users"], 1)
        user_ids = self.discussion_manager.get_users(discussion_id)
        names = self.discussion_manager.get_names(discussion_id)
        self.assertTrue(ip in user_ids)
        self.assertEqual(len(user_ids), 1)
        self.assertEqual(len(names), 1)
        ret_name1 = self.discussion_manager.get_user_name(discussion_id, ip)
        self.assertEqual(ret_name1, name)

        # cannot join with existing name
        info = self.discussion_manager.join(discussion_id, ip2, name)
        self.assertTrue(info is None)
        user_ids = self.discussion_manager.get_users(discussion_id)
        names = self.discussion_manager.get_names(discussion_id)
        self.assertTrue(ip in user_ids)
        self.assertFalse(ip2 in user_ids)
        self.assertEqual(len(user_ids), 1)
        self.assertTrue(name in names)
        self.assertFalse(name2 in names)
        self.assertEqual(len(names), 1)
        num_users = self.discussion_manager.get_num_users(discussion_id)
        self.assertEqual(num_users, 1)

        # attempt joining with same ip but different name
        info = self.discussion_manager.join(discussion_id, ip, name2)
        self.assertTrue(info is not None)
        user_ids = self.discussion_manager.get_users(discussion_id)
        names = self.discussion_manager.get_names(discussion_id)
        self.assertTrue(ip in user_ids)
        self.assertEqual(len(user_ids), 1)
        self.assertTrue(name in names)
        self.assertFalse(name2 in names)
        self.assertEqual(len(names), 1)
        num_users = self.discussion_manager.get_num_users(discussion_id)
        self.assertEqual(num_users, 1)

        # join with different name
        info = self.discussion_manager.join(discussion_id, ip2, name2)
        self.assertTrue("discussion_id" in info)
        self.assertTrue("title" in info)
        self.assertTrue("theme" in info)
        self.assertTrue("num_users" in info)
        self.assertEqual(info["discussion_id"], discussion_id)
        self.assertEqual(info["title"], title)
        self.assertEqual(info["theme"], theme)
        self.assertEqual(info["num_users"], 2)
        user_ids = self.discussion_manager.get_users(discussion_id)
        names = self.discussion_manager.get_names(discussion_id)
        self.assertTrue(ip in user_ids)
        self.assertTrue(ip2 in user_ids)
        self.assertEqual(len(user_ids), 2)
        self.assertTrue(name in names)
        self.assertTrue(name2 in names)
        self.assertEqual(len(names), 2)
        ret_name1 = self.discussion_manager.get_user_name(discussion_id, ip)
        self.assertEqual(ret_name1, name)
        ret_name2 = self.discussion_manager.get_user_name(discussion_id, ip2)
        self.assertEqual(ret_name2, name2)
        num_users = self.discussion_manager.get_num_users(discussion_id)
        self.assertEqual(num_users, 2)

        # test leaving
        info = self.discussion_manager.leave(discussion_id, ip)
        self.assertTrue("discussion_id" in info)
        self.assertTrue("num_users" in info)
        self.assertEqual(info["discussion_id"], discussion_id)
        self.assertEqual(info["num_users"], 1)
        user_ids = self.discussion_manager.get_users(discussion_id)
        self.assertFalse(ip in user_ids)
        num_users = self.discussion_manager.get_num_users(discussion_id)
        self.assertEqual(num_users, 1)

        info = self.discussion_manager.leave(discussion_id, ip2)
        self.assertTrue("discussion_id" in info)
        self.assertTrue("num_users" in info)
        self.assertEqual(info["discussion_id"], discussion_id)
        self.assertEqual(info["num_users"], 0)
        user_ids = self.discussion_manager.get_users(discussion_id)
        self.assertFalse(ip in user_ids)
        self.assertFalse(ip2 in user_ids)
        num_users = self.discussion_manager.get_num_users(discussion_id)
        self.assertEqual(num_users, 0)

        # attempt rejoining
        info = self.discussion_manager.join(discussion_id, ip, name)
        self.assertFalse(info is None)
        self.assertTrue("discussion_id" in info)
        self.assertTrue("title" in info)
        self.assertTrue("theme" in info)
        self.assertTrue("num_users" in info)
        self.assertEqual(info["discussion_id"], discussion_id)
        self.assertEqual(info["title"], title)
        self.assertEqual(info["theme"], theme)
        self.assertEqual(info["num_users"], 1)
        user_ids = self.discussion_manager.get_users(discussion_id)
        names = self.discussion_manager.get_names(discussion_id)
        self.assertTrue(ip in user_ids)
        self.assertEqual(len(user_ids), 1)
        self.assertTrue(name in names)
        self.assertEqual(len(names), 1)
        num_users = self.discussion_manager.get_num_users(discussion_id)
        self.assertEqual(num_users, 1)

        info = self.discussion_manager.leave(discussion_id, ip)
        self.assertTrue("discussion_id" in info)
        self.assertTrue("num_users" in info)
        self.assertEqual(info["discussion_id"], discussion_id)
        self.assertEqual(info["num_users"], 0)
        user_ids = self.discussion_manager.get_users(discussion_id)
        self.assertFalse(ip in user_ids)
        self.assertFalse(ip2 in user_ids)
        num_users = self.discussion_manager.get_num_users(discussion_id)
        self.assertEqual(num_users, 0)

    def test_post_block(self):
        ip1 = "12345"
        ip2 = "67890"
        name1 = "hello"
        name2 = "goodbye"
        self.user_manager.create(ip1)
        self.user_manager.create(ip2)
        discussion_id = asyncio.run(create(self))
        self.discussion_manager.join(discussion_id, ip1, name1)
        self.discussion_manager.join(discussion_id, ip2, name2)

        blocks1 = ["I am Fred.", "You are Fred.", "We are Fred."]
        blocks2 = ["She is Lee.", "They are Lee."]
        post_obj1 = self.discussion_manager.create_post(discussion_id, ip1, blocks1)
        post_id1 = post_obj1.post_id
        post_obj1 = self.discussion_manager.get_post(discussion_id, post_id1)
        self.assertFalse(post_obj1 is None)

        post_obj2 = self.discussion_manager.create_post(discussion_id, ip2, blocks2)
        post_id2 = post_obj2.post_id
        post_obj2 = self.discussion_manager.get_post(discussion_id, post_id2)
        self.assertFalse(post_obj2 is None)

        posts_obj = self.discussion_manager.get_posts(discussion_id)
        posts_info = self.discussion_manager.get_posts_flattened(discussion_id)
        posts_id = [p._id for p in posts_obj]
        self.assertTrue(post_id1 in posts_id)
        self.assertTrue(post_id2 in posts_id)
        posts_id = [p["post_id"] for p in posts_info]
        self.assertTrue(post_id1 in posts_id)
        self.assertTrue(post_id2 in posts_id)

        blocks = blocks1 + blocks2
        blocks_objs = self.discussion_manager.get_blocks(discussion_id)
        blocks_body = [b.body for b in blocks_objs]
        self.assertEqual(set(blocks), set(blocks_body))
        for b in post_obj1.blocks:
            block_obj = self.discussion_manager.get_block(discussion_id, b)
            self.assertTrue(block_obj.body in blocks)

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

#     def test_tag_post(self):
#         ip1 = "12345"
#         ip2 = "67890"
#         name1 = "hello"
#         name2 = "goodbye"
#         self.user_manager.create(ip1)
#         self.user_manager.create(ip2)
#         discussion_id = asyncio.run(create(self))
#         self.discussion_manager.join(discussion_id, ip1, name1)
#         self.discussion_manager.join(discussion_id, ip2, name2)
# 
#         blocks = ["im a post"]
#         post_obj1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
#         post_id = post_obj1["post_id"]
#         tag = "imatag"
#         self.discussion_manager.post_add_tag(discussion_id, ip1, post_id, tag)
#         post_obj = self.discussion_manager.get_post(discussion_id, post_id)
#         self.assertTrue(tag in post_obj["tags"])
# 
#         self.discussion_manager.post_remove_tag(discussion_id, ip1, post_id, tag)
#         post_obj = self.discussion_manager.get_post(discussion_id, post_id)
#         self.assertFalse(tag in post_obj["tags"])
# 
#         self.discussion_manager.leave(discussion_id, ip1)
#         self.discussion_manager.leave(discussion_id, ip2)

    def test_tag_block(self):
        ip1 = "12345"
        ip2 = "67890"
        name1 = "hello"
        name2 = "goodbye"
        self.user_manager.create(ip1)
        self.user_manager.create(ip2)
        discussion_id = asyncio.run(create(self))
        self.discussion_manager.join(discussion_id, ip1, name1)
        self.discussion_manager.join(discussion_id, ip2, name2)

        blocks = ["im a post"]
        post_obj1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
        block_id = post_obj1.blocks[0]
        tag = "imatag"
        self.discussion_manager.block_add_tag(discussion_id, ip1, block_id, tag)
        block_obj = self.discussion_manager.get_block(discussion_id, block_id)
        self.assertTrue(tag in block_obj.tags)

        self.discussion_manager.block_remove_tag(discussion_id, ip1, block_id, tag)
        block_obj = self.discussion_manager.get_block(discussion_id, block_id)
        self.assertFalse(tag in block_obj.tags)

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

#     def test_user_save_search(self):
#         ip1 = "12345"
#         ip2 = "67890"
#         name1 = "hello"
#         name2 = "goodbye"
#         self.user_manager.create(ip1)
#         self.user_manager.create(ip2)
#         discussion_id = asyncio.run(create(self))
#         self.discussion_manager.join(discussion_id, ip1, name1)
#         self.discussion_manager.join(discussion_id, ip2, name2)
# 
#         blocks = ["I like whales", "do you like whales?"]
#         post_obj1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
#         post_id1 = post_obj1["post_id"]
#         blocks2 = ["I sort of like whales.", "Whales are big."]
#         post_obj2 = self.discussion_manager.create_post(discussion_id, ip2, blocks2)
#         post_id2 = post_obj2["post_id"]
#         block_id1 = post_obj2["blocks"][1]
#         blocks3 = ["But sometimes whales are scary you know?"]
#         post_obj3 = self.discussion_manager.create_post(discussion_id, ip2, blocks3)
#         post_id3 = post_obj3["post_id"]
#         block_id2 = post_obj3["blocks"][0]
# 
#         # tag before
#         tag = "animals"
#         self.discussion_manager.block_add_tag(discussion_id, ip1, block_id2, tag)
# 
#         self.user_manager.save_post(ip1, discussion_id, post_id2)
#         self.user_manager.save_post(ip1, discussion_id, post_id1)
#         self.user_manager.save_block(ip1, discussion_id, block_id1)
#         self.user_manager.save_block(ip1, discussion_id, block_id2)
# 
#         # tag after
#         self.discussion_manager.post_add_tag(discussion_id, ip2, post_id2, tag)
# 
#         saved_posts = self.discussion_manager.get_user_saved_posts(discussion_id, ip1)
#         saved_blocks = self.discussion_manager.get_user_saved_blocks(discussion_id, ip1)
#         self.assertEqual(set([p["_id"] for p in saved_posts]), {post_id1, post_id2})
#         self.assertEqual(set([b["body"] for b in saved_blocks]), {blocks2[1], blocks3[0]})
#         self.assertTrue(all(["freq_dict" in p for p in saved_posts]))
#         self.assertTrue(all(["freq_dict" in b for b in saved_blocks]))
# 
#         results = self.discussion_manager.user_saved_scope_search(discussion_id, ip1, "whale")
#         self.assertEqual(set(results["blocks"]), {block_id2, block_id1})
#         self.assertEqual(set(results["posts"]), {post_id2, post_id1})
# 
#         results = self.discussion_manager.user_saved_tag_search(discussion_id, ip1, [tag])
#         self.assertEqual(results["blocks"], [block_id2])
#         self.assertEqual(results["posts"], [post_id2])
# 
#         self.discussion_manager.leave(discussion_id, ip1)
#         self.discussion_manager.leave(discussion_id, ip2)

#     def test_search(self):
#         ip1 = "12345"
#         ip2 = "67890"
#         name1 = "hello"
#         name2 = "goodbye"
#         self.user_manager.create(ip1)
#         self.user_manager.create(ip2)
#         discussion_id = asyncio.run(create(self))
#         self.discussion_manager.join(discussion_id, ip1, name1)
#         self.discussion_manager.join(discussion_id, ip2, name2)
# 
#         blocks = ["I like whales", "do you like whales?"]
#         post_obj1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
#         post_id1 = post_obj1["post_id"]
#         blocks2 = ["I sort of like whales.", "Whales are big."]
#         post_obj2 = self.discussion_manager.create_post(discussion_id, ip2, blocks2)
#         post_id2 = post_obj2["post_id"]
#         blocks3 = ["But sometimes whales are scary you know?"]
#         post_obj3 = self.discussion_manager.create_post(discussion_id, ip2, blocks3)
#         post_id3 = post_obj3["post_id"]
# 
#         tag = "animals"
#         self.discussion_manager.block_add_tag(discussion_id, ip1, post_obj2["blocks"][1], tag)
#         self.discussion_manager.block_add_tag(discussion_id, ip2, post_obj3["blocks"][0], tag)
#         self.discussion_manager.post_add_tag(discussion_id, ip2, post_id2, tag)
#         self.discussion_manager.post_add_tag(discussion_id, ip1, post_id1, tag)
# 
#         results = self.discussion_manager.discussion_scope_search(discussion_id, "whales")
#         self.assertEqual(
#             set(results["blocks"]),
#             set(post_obj3["blocks"] + post_obj2["blocks"] + post_obj1["blocks"])
#         )
#         self.assertEqual(set(results["posts"]), {post_id2, post_id1, post_id3})
# 
#         results = self.discussion_manager.discussion_tag_search(discussion_id, [tag])
#         self.assertEqual(set(results["blocks"]), {post_obj3["blocks"][0], post_obj2["blocks"][1]})
#         self.assertEqual(set(results["posts"]), {post_id2, post_id1})
# 
#         self.discussion_manager.leave(discussion_id, ip1)
#         self.discussion_manager.leave(discussion_id, ip2)

    def test_summary(self):
        block1 = "hello there"  # 11
        block2 = "hello my friends"  # 16
        block3 = "pie is nice"  # 11
        block4 = "pie is disgusting"  # 17
        trans_block = "transclude<400>goodbye then"  # 12
        short = "four"  # 4
        discussion_id = asyncio.run(create(self, block_char_limit=15))
        block_id0, err = self.discussion_manager.summary_add_block(discussion_id, trans_block)
        self.assertFalse(block_id0 is None)
        self.assertTrue(err is None)
        self.discussion_manager.summary_remove_block(discussion_id, block_id0)
        block_id1, err = self.discussion_manager.summary_add_block(discussion_id, block1)
        self.assertFalse(block_id1 is None)
        self.assertTrue(err is None)
        block_id2, err = self.discussion_manager.summary_add_block(discussion_id, block2)
        self.assertTrue(block_id2 is None)
        self.assertFalse(err is None)
        err = self.discussion_manager.summary_modify_block(discussion_id, block_id1, block2)
        self.assertFalse(err is None)
        err = self.discussion_manager.summary_modify_block(discussion_id, block_id1, block3)
        self.assertTrue(err is None)
        self.discussion_manager.summary_remove_block(discussion_id, block_id1)

        discussion_id = asyncio.run(create(self, summary_char_limit=60))
        block_id0, err = self.discussion_manager.summary_add_block(discussion_id, trans_block)
        self.assertFalse(block_id0 is None)
        self.assertTrue(err is None)
        block_id1, err = self.discussion_manager.summary_add_block(discussion_id, block1)
        self.assertFalse(block_id1 is None)
        self.assertTrue(err is None)
        block_id2, err = self.discussion_manager.summary_add_block(discussion_id, block2)
        self.assertFalse(block_id2 is None)
        self.assertTrue(err is None)
        block_id3, err = self.discussion_manager.summary_add_block(discussion_id, block3)
        self.assertFalse(block_id3 is None)
        self.assertTrue(err is None)
        block_id4, err = self.discussion_manager.summary_add_block(discussion_id, block4)
        self.assertFalse(err is None)
        self.assertTrue(block_id4 is None)
        err = self.discussion_manager.summary_modify_block(discussion_id, block_id1, block3)
        self.assertTrue(err is None)
        err = self.discussion_manager.summary_modify_block(discussion_id, block_id1, block4 + block4)
        self.assertFalse(err is None)
        self.discussion_manager.summary_remove_block(discussion_id, block_id0)
        self.discussion_manager.summary_remove_block(discussion_id, block_id1)
        self.discussion_manager.summary_remove_block(discussion_id, block_id2)
        self.discussion_manager.summary_remove_block(discussion_id, block_id3)
        self.discussion_manager.summary_remove_block(discussion_id, block_id4)

        discussion_id = asyncio.run(create(self, block_char_limit=15, summary_char_limit=60))
        block_id0, err = self.discussion_manager.summary_add_block(discussion_id, trans_block)
        self.assertFalse(block_id0 is None)
        self.assertTrue(err is None)
        block_id1, err = self.discussion_manager.summary_add_block(discussion_id, block2)
        self.assertTrue(block_id1 is None)
        self.assertFalse(err is None)
        block_id2, err = self.discussion_manager.summary_add_block(discussion_id, block4)
        self.assertTrue(block_id2 is None)
        self.assertFalse(err is None)
        block_id3, err = self.discussion_manager.summary_add_block(discussion_id, block1)
        self.assertFalse(block_id3 is None)
        self.assertTrue(err is None)
        block_id4, err = self.discussion_manager.summary_add_block(discussion_id, block3)
        self.assertFalse(block_id4 is None)
        self.assertTrue(err is None)
        block_id5, err = self.discussion_manager.summary_add_block(discussion_id, block1)
        self.assertFalse(block_id5 is None)
        self.assertTrue(err is None)
        block_id6, err = self.discussion_manager.summary_add_block(discussion_id, block1)
        self.assertFalse(block_id6 is None)
        self.assertTrue(err is None)
        err = self.discussion_manager.summary_modify_block(discussion_id, block_id3, block1)
        self.assertTrue(err is None)
        block_id7, err = self.discussion_manager.summary_add_block(discussion_id, block3)
        self.assertTrue(block_id7 is None)
        self.assertFalse(err is None)
        block_id8, err = self.discussion_manager.summary_add_block(discussion_id, short)
        self.assertFalse(block_id8 is None)
        self.assertTrue(err is None)
        err = self.discussion_manager.summary_modify_block(discussion_id, block_id3, block4)
        self.assertFalse(err is None)
        err = self.discussion_manager.summary_modify_block(discussion_id, block_id8, block3)
        self.assertTrue(err is None)
        self.discussion_manager.summary_remove_block(discussion_id, block_id0)
        self.discussion_manager.summary_remove_block(discussion_id, block_id1)
        self.discussion_manager.summary_remove_block(discussion_id, block_id2)
        self.discussion_manager.summary_remove_block(discussion_id, block_id3)
        self.discussion_manager.summary_remove_block(discussion_id, block_id4)
        self.discussion_manager.summary_remove_block(discussion_id, block_id5)
        self.discussion_manager.summary_remove_block(discussion_id, block_id6)
        self.discussion_manager.summary_remove_block(discussion_id, block_id7)
        self.discussion_manager.summary_remove_block(discussion_id, block_id8)


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("DiscussionManagerTest").setLevel(logging.DEBUG)
    unittest.main()
