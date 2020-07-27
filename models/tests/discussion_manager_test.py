import logging
import sys
import time
import unittest
import asyncio
import uuid

from models.global_manager import GlobalManager


async def create(self, *args):
    return await self.discussion_manager.create(*args)


class DiscussionManagerTest(unittest.TestCase):

    def setUp(self):
        self.log = logging.getLogger("DiscussionManagerTest")
        global_manager = GlobalManager(test=True)
        self.discussion_manager = global_manager.discussion_manager
        self.user_manager = global_manager.user_manager

    def test_create_get(self):
        title = "fake_title"
        theme = "fake_theme"
        time_limit = 5
        discussion_id = asyncio.run(create(self, title, theme, time_limit))
        discussion_data = self.discussion_manager.get(discussion_id)
        self.assertFalse(discussion_data is None)
        self.assertTrue(discussion_data["expire_at"] is not None)
        self.assertFalse(discussion_data["expired"])
        discussion_ids = self.discussion_manager.get_all()
        self.assertTrue(discussion_id in discussion_ids)
        time.sleep(time_limit + 1)
        discussion_data = self.discussion_manager.get(discussion_id)
        self.assertTrue(discussion_data["expired"])

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
        self.assertTrue(info is None)
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
        post_data1 = self.discussion_manager.create_post(discussion_id, ip1, blocks1)
        post_id1 = post_data1["_id"]
        post_data1 = self.discussion_manager.get_post(discussion_id, post_id1)
        self.assertFalse(post_data1 is None)

        post_data2 = self.discussion_manager.create_post(discussion_id, ip2, blocks2)
        post_id2 = post_data2["_id"]
        post_data2 = self.discussion_manager.get_post(discussion_id, post_id2)
        self.assertFalse(post_data2 is None)

        posts_data = self.discussion_manager.get_posts(discussion_id)
        posts_info = self.discussion_manager.get_posts_flattened(discussion_id)
        posts_id = [p["_id"] for p in posts_data]
        self.assertTrue(post_id1 in posts_id)
        self.assertTrue(post_id2 in posts_id)
        posts_id = [p["post_id"] for p in posts_info]
        self.assertTrue(post_id1 in posts_id)
        self.assertTrue(post_id2 in posts_id)

        blocks = blocks1 + blocks2
        blocks_data = self.discussion_manager.get_blocks(discussion_id)
        blocks_body = [b["body"] for b in blocks_data]
        self.assertEqual(set(blocks), set(blocks_body))
        for b in post_data1["blocks"]:
            block_data = self.discussion_manager.get_block(discussion_id, b)
            self.assertTrue(block_data["body"] in blocks)

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

    def test_tag_post(self):
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
        post_data1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
        post_id = post_data1["_id"]
        tag = "imatag"
        self.discussion_manager.post_add_tag(discussion_id, ip1, post_id, tag)
        post_data = self.discussion_manager.get_post(discussion_id, post_id)
        self.assertTrue(tag in post_data["tags"])

        self.discussion_manager.post_remove_tag(discussion_id, ip1, post_id, tag)
        post_data = self.discussion_manager.get_post(discussion_id, post_id)
        self.assertFalse(tag in post_data["tags"])

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

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
        post_data1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
        block_id = post_data1["blocks"][0]
        tag = "imatag"
        self.discussion_manager.block_add_tag(discussion_id, ip1, block_id, tag)
        block_data = self.discussion_manager.get_block(discussion_id, block_id)
        self.assertTrue(tag in block_data["tags"])

        self.discussion_manager.block_remove_tag(discussion_id, ip1, block_id, tag)
        block_data = self.discussion_manager.get_block(discussion_id, block_id)
        self.assertFalse(tag in block_data["tags"])

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

    def test_user_save_search(self):
        ip1 = "12345"
        ip2 = "67890"
        name1 = "hello"
        name2 = "goodbye"
        self.user_manager.create(ip1)
        self.user_manager.create(ip2)
        discussion_id = asyncio.run(create(self))
        self.discussion_manager.join(discussion_id, ip1, name1)
        self.discussion_manager.join(discussion_id, ip2, name2)

        blocks = ["I like whales", "do you like whales?"]
        post_data1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
        post_id1 = post_data1["_id"]
        blocks2 = ["I sort of like whales.", "Whales are big."]
        post_data2 = self.discussion_manager.create_post(discussion_id, ip2, blocks2)
        post_id2 = post_data2["_id"]
        block_id1 = post_data2["blocks"][1]
        blocks3 = ["But sometimes whales are scary you know?"]
        post_data3 = self.discussion_manager.create_post(discussion_id, ip2, blocks3)
        post_id3 = post_data3["_id"]
        block_id2 = post_data3["blocks"][0]

        # tag before
        tag = "animals"
        self.discussion_manager.block_add_tag(discussion_id, ip1, block_id2, tag)

        self.user_manager.save_post(ip1, discussion_id, post_id2)
        self.user_manager.save_post(ip1, discussion_id, post_id1)
        self.user_manager.save_block(ip1, discussion_id, block_id1)
        self.user_manager.save_block(ip1, discussion_id, block_id2)

        # tag after
        self.discussion_manager.post_add_tag(discussion_id, ip2, post_id2, tag)

        saved_posts = self.discussion_manager.get_user_saved_posts(discussion_id, ip1)
        saved_blocks = self.discussion_manager.get_user_saved_blocks(discussion_id, ip1)
        self.assertEqual(set([p["_id"] for p in saved_posts]), {post_id1, post_id2})
        self.assertEqual(set([b["body"] for b in saved_blocks]), {blocks2[1], blocks3[0]})
        self.assertTrue(all(["freq_dict" in p for p in saved_posts]))
        self.assertTrue(all(["freq_dict" in b for b in saved_blocks]))

        results = self.discussion_manager.user_saved_scope_search(discussion_id, ip1, "whale")
        self.assertEqual(set(results["blocks"]), {block_id2, block_id1})
        self.assertEqual(set(results["posts"]), {post_id2, post_id1})

        results = self.discussion_manager.user_saved_tag_search(discussion_id, ip1, [tag])
        self.assertEqual(results["blocks"], [block_id2])
        self.assertEqual(results["posts"], [post_id2])

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)

    def test_search(self):
        ip1 = "12345"
        ip2 = "67890"
        name1 = "hello"
        name2 = "goodbye"
        self.user_manager.create(ip1)
        self.user_manager.create(ip2)
        discussion_id = asyncio.run(create(self))
        self.discussion_manager.join(discussion_id, ip1, name1)
        self.discussion_manager.join(discussion_id, ip2, name2)

        blocks = ["I like whales", "do you like whales?"]
        post_data1 = self.discussion_manager.create_post(discussion_id, ip1, blocks)
        post_id1 = post_data1["_id"]
        blocks2 = ["I sort of like whales.", "Whales are big."]
        post_data2 = self.discussion_manager.create_post(discussion_id, ip2, blocks2)
        post_id2 = post_data2["_id"]
        blocks3 = ["But sometimes whales are scary you know?"]
        post_data3 = self.discussion_manager.create_post(discussion_id, ip2, blocks3)
        post_id3 = post_data3["_id"]

        tag = "animals"
        self.discussion_manager.block_add_tag(discussion_id, ip1, post_data2["blocks"][1], tag)
        self.discussion_manager.block_add_tag(discussion_id, ip2, post_data3["blocks"][0], tag)
        self.discussion_manager.post_add_tag(discussion_id, ip2, post_id2, tag)
        self.discussion_manager.post_add_tag(discussion_id, ip1, post_id1, tag)

        results = self.discussion_manager.discussion_scope_search(discussion_id, "whales")
        self.assertEqual(
            set(results["blocks"]),
            set(post_data3["blocks"] + post_data2["blocks"] + post_data1["blocks"])
        )
        self.assertEqual(set(results["posts"]), {post_id2, post_id1, post_id3})

        results = self.discussion_manager.discussion_tag_search(discussion_id, [tag])
        self.assertEqual(set(results["blocks"]), {post_data3["blocks"][0], post_data2["blocks"][1]})
        self.assertEqual(set(results["posts"]), {post_id2, post_id1})

        self.discussion_manager.leave(discussion_id, ip1)
        self.discussion_manager.leave(discussion_id, ip2)


if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("DiscussionManagerTest").setLevel(logging.DEBUG)
    unittest.main()
