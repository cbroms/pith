from dotenv import load_dotenv
load_dotenv(dotenv_path=".env.test")

import subprocess
import time
import unittest
import logging
import sys
import os
import signal

from tests.app_test import AppTest
from tests.discussion_manager_test import DiscussionManagerTest


# def suite():
#     suite = unittest.TestSuite()
#     suite.addTest(DiscussionManagerTest())
#     return suite


if __name__ == '__main__':
    print("starting worker script")
    worker_process = subprocess.Popen(["dotenv", "--file", ".env.test", "run", "python", "worker.py"])
    time.sleep(5)
    print("starting webapp")
    app_process = subprocess.Popen(["dotenv", "--file", ".env.test", "run", "uvicorn",
                                    "--port", "8000", "--log-level", "critical", "app:app"])
    time.sleep(5)
    print("background processes startup complete")
    print("\n\nstarting tests")
    logging.basicConfig(stream=sys.stderr)
    logging.getLogger("DiscussionManagerTest").setLevel(logging.DEBUG)
    logging.getLogger("AppTest").setLevel(logging.DEBUG)
    unittest.main(exit=False)

    print("\n\ntests complete, aborting subprocesses")
    os.kill(app_process.pid, signal.SIGINT)
    os.kill(worker_process.pid, signal.SIGINT)
