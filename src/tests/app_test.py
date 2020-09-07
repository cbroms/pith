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

#     def test_create_user(self):
#         data = {"user_id": "testID"}
#         self.sio.emit("create_user", data)

    def _joined(self, resp):
        data = loads(resp)
        logging.info(data)
        self.assertTrue("discussion_id" in data)

    def test_disc_join(self):
        data = {}
        self.sio.emit("join", data, callback=lambda resp: self._joined(resp))

if __name__ == "__main__":
    unittest.main()
