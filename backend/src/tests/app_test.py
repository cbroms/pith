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
        self.log(resp)

    def _leave(self, resp):
        self.log(resp)

    def test_disc(self):
        requests = [
          {},
        ]
        for r in requests:
          self.sio.emit("join", r, callback=lambda resp: self._join(resp))
          self.sio.emit("leave", callback=lambda resp: self._leave(resp))

if __name__ == "__main__":
    unittest.main()
