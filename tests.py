import subprocess
import time

if __name__ == '__main__':
    print("starting worker script")
    subprocess.Popen(["python", "worker.py", "--test"])
    time.sleep(5)
    print("starting tests")
    subprocess.Popen(["python", "models/tests/discussion_manager_test.py"])
