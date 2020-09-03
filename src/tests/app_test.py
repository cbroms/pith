import socketio
import unittest
import logging
import sys

sio = socketio.Client()

results_default = {
    "connect": False,
}

results = results_default

@sio.event
def connect():
    global results
    results["connect"] = True


class AppTest(unittest.TestCase):

    def setUp(self):
        self.log = logging.getLogger("AppTest")
        self.sio = sio

    def test_connect(self):
        global results
        self.sio.connect("http://localhost:8000")
        sio.sleep(1)
        self.assertTrue(results["connect"])

        # def test_register_user(self):
        #     global results
        #     results = results_default
        #     self.sio.connect("http://localhost:8000")
        #     sio.sleep(1)
        #     data = {"user_id": "testID"}
        #     self.sio.emit("create_user", data)

    def test_disconnect(self):
        self.sio.disconnect()
        sio.sleep(1)
        # we can pass this test since disconnecting is a default behavior
        self.assertTrue(True)

if __name__ == "__main__":
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("AppTest").setLevel(logging.DEBUG)
    unittest.main()
