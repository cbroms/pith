from json import loads
import logging
import socketio
import unittest


class AppTest(unittest.TestCase):

    def setUp(self):
        self.log = logging.getLogger("AppTest")
        self.sio = socketio.Client()
        self.sio.connect("http://app:8080" + "/discussion")
        self.sio.sleep(1)

    def tearDown(self):
        self.sio.disconnect()
        self.sio.sleep(1)

    def _join(self, resp):
        data = loads(resp)
        self.assertTrue("discussion_id" in data)
        self.assertTrue("title" in data)
        self.assertTrue("theme" in data)
        self.assertTrue("num_users" in data)

    def _get_num_users(self, resp):
        data = loads(resp)
        self.assertTrue("num_users" in data)

    def _leave(self, resp):
        data = loads(resp)
        self.assertTrue("discussion_id" in data)
        self.assertTrue("num_users" in data)

    def _get_posts(self, resp):
        data = loads(resp)
        if len(data) > 0:
          self.assertTrue("post_id" in data)
          self.assertTrue("author" in data)
          self.assertTrue("author_name" in data)
          self.assertTrue("created_at" in data)
          self.assertTrue("blocks" in data)
    
    def _create_post(self, resp):
        data = loads(resp)
        self.assertTrue("post_id" in data)
        self.assertTrue("blocks" in data)
        self.assertTrue("created_at" in data)
        self.assertTrue("author_name" in data)

    def _invalid(self, resp):
      self.assertFalse(resp)

    def _get_block(self, resp):
        data = loads(resp)
        self.assertTrue("block_id" in data)
        self.assertTrue("body" in data)
        self.assertTrue("tags" in data)
        self.assertTrue("owner" in data["tags"])

    def _save_block(self, resp):
        data = loads(resp)
        self.assertTrue("block_id" in data)

    def _unsave_block(self, resp):
        data = loads(resp)
        self.assertTrue("block_id" in data)

    def _get_saved_blocks(self, resp):
        data = loads(resp)
        self.assertTrue("block_ids" in data) 

    def _block_add_tag(self, resp):
        data = loads(resp)
        self.assertTrue("block_id" in data)
        self.assertTrue("user_id" in data)
        self.assertTrue("tag" in data)

    def _block_remove_tag(self, resp):
        data = loads(resp)
        self.assertTrue("block_id" in data)
        self.assertTrue("tag" in data)

    def _search_basic(self, resp):
        data = loads(resp)
        self.assertTrue("blocks" in data)

    def _search_tags(self, resp):
        data = loads(resp)
        self.assertTrue("blocks" in data)

    def _search_user_saved_basic(self, resp):
        data = loads(resp)
        self.assertTrue("blocks" in data)

    def _search_user_saved_tags(self, resp):
        data = loads(resp)
        self.assertTrue("blocks" in data)

    def _summary_add_block(self, resp):
        data = loads(resp)
        self.assertTrue("block_id" in data)
        self.assertTrue("body" in data)

    def _summary_modify_block(self, resp):
        data = loads(resp)
        self.assertTrue("block_id" in data)
        self.assertTrue("body" in data)

    def _summary_remove_block(self, resp): 
        data = loads(resp)
        self.assertTrue("block_id" in data)

    def test_disc(self):
        requests = [
          {},
          {"title": "", "theme": ""},
        ]
        for r in requests:
          self.sio.emit("join", r, callback=lambda resp: self._join(resp))
          self.sio.emit("get_num_users", callback=lambda resp: self._get_num_users(resp))
          self.sio.emit("leave", callback=lambda resp: self._leave(resp))

    def test_disc_posts(self):
        self.sio.emit("join", {}, callback=lambda resp: self._join(resp))
        # invalid
        self.sio.emit("create_post", {}, callback=lambda resp: self._invalid(resp))
        self.sio.emit("create_post", {"blocks": ["a", "b", "c"]}, callback=lambda resp: self._create_post(resp))
        self.sio.emit("get_posts", callback=lambda resp: self._get_posts(resp))
        self.sio.emit("search_basic", {"query": "a"}, callback=lambda resp: self._search_basic(resp))
        self.sio.emit("search_tags", {"tags": ["1", "2"]}, callback=lambda resp: self._search_tags(resp))
        self.sio.emit("leave", callback=lambda resp: self._leave(resp))
        
    def test_blocks(self):
        self.sio.emit("join", {}, callback=lambda resp: self._join(resp))

        def _test_blocks(resp):
          self._create_post(resp)
          data = loads(resp)
          blocks = data["blocks"]
          tags = ["1", "2", "3"]

          for i in range(3):
            self.sio.emit("get_block", {"block_id": blocks[i]}, callback=lambda resp: self._get_block(resp))
            self.sio.emit("save_block", {"block_id": blocks[i]}, callback=lambda resp: self._save_block(resp))
            self.sio.emit("block_add_tag", {"block_id": blocks[i], "tag": tags[i]}, callback=lambda resp: self._block_add_tag(resp))

          self.sio.emit("get_saved_blocks", callback=lambda resp: self._get_saved_blocks(resp))
          self.sio.emit("search_user_saved_basic", {"query": "a"}, callback=lambda resp: self._search_user_saved_basic(resp))
          self.sio.emit("search_user_saved_tags", {"tags": ["1", "2"]}, callback=lambda resp: self._search_user_saved_tags(resp))

          for i in range(3):
            self.sio.emit("unsave_block", {"block_id": blocks[i]}, callback=lambda resp: self._unsave_block(resp))
            self.sio.emit("block_remove_tag", {"block_id": blocks[i], "tag": tags[i]}, callback=lambda resp: self._block_remove_tag(resp))

        self.sio.emit("create_post", {"blocks": ["a", "b", "c"]}, callback=lambda resp: _test_blocks(resp))
        self.sio.emit("leave", callback=lambda resp: self._leave(resp))

    def test_summary(self):

      def _test_summary(self, resp):
        self._summary_add_block(resp)
        data = loads(resp)
        block_id = data["block_id"]
        self.sio.emit("summary_modify_block", {"block_id": block_id, "body": "test2"}, callback=lambda resp: self._summary_modify_block(resp))
        self.sio.emit("summary_remove_block", {"block_id": block_id}, callback=lambda resp: self._summary_remove_block(resp))

      self.sio.emit("summary_add_block", {"body": "test1"}, callback=lambda resp: _test_summary(resp)) 
      self.sio.emit("leave", callback=lambda resp: self._leave(resp))


if __name__ == "__main__":
    unittest.main()
