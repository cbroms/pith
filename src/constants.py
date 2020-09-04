import os
import re

from arq.connections import RedisSettings

from dotenv import load_dotenv
load_dotenv()

# whether we are testing
TEST = os.getenv("TEST", False)

# the port to run the socketio server 
PORT = os.getenv("PORT", 8080)

# connect to the redis server instance. When running locally, use 127.0.0.1, or
# use the container name if using docker within a docker network
SOCKET_REDIS = "redis://{}:{}/0".format(os.getenv("REDIS_IP", "127.0.0.1"), os.getenv("REDIS_PORT", 6379))

# the job queue's redis configuration. Could use a different redis server
# instance than the socket message queue, but for now we can keep them the same.
ARQ_REDIS = RedisSettings(host=os.getenv("REDIS_IP", "127.0.0.1"), port=int(os.getenv("REDIS_PORT", 6379)))

# the maximum number to times we should try to rerun a task in the queue if it fails
MAX_QUEUED_JOB_RETRIES = 5
# the maximum number of jobs we should try to run at once from the queue
MAX_JOBS = 10

# using ISO so this can be easily parsed in js with Date()
DATE_TIME_FMT = "%Y-%m-%dT%H:%M:%SZ"
MONGO_CONN = os.getenv("MONGO_CONN", "mongodb://localhost:27017")
MONGO_CONN_TEST = os.getenv("MONGO_CONN_TEST", "mongodb://localhost:27017")
MONGODB_NAME = "pith"
MONGODB_NAME_TEST = "pith-test"

# compiled searcher for transclusion header
transclusion_header = re.compile(r"transclude<\d*>")
