import os
import socketio
import re

from arq import create_pool
from arq.connections import RedisSettings

from dotenv import load_dotenv
load_dotenv()


# connect to the redis server instance. When running locally, use 127.0.0.1, or
# use the container name if using docker within a docker network
SOCKET_REDIS = "redis://{}:{}/0".format(os.getenv("REDIS_IP"), os.getenv("REDIS_PORT"))

# the job queue's redis configuration. Could use a different redis server
# instance than the socket message queue, but for now we can keep them the same.
ARQ_REDIS = RedisSettings(host=os.getenv("REDIS_IP"), port=int(os.getenv("REDIS_PORT")))

# the maximum number to times we should try to rerun a task in the queue if it fails
MAX_QUEUED_JOB_RETRIES = 5
# the maximum number of jobs we should try to run at once from the queue
MAX_JOBS = 10


# using ISO so this can be easily parsed in js with Date()
DATE_TIME_FMT = "%Y-%m-%dT%H:%M:%SZ"
MONGO_CONN = os.getenv("MONGO_CONN")

# compiled searcher for transclusion header
transclusion_header = re.compile(r"transclude<\d*>")


# manage creating and getting the redis pool instance. We only want to
# instantiate the redis pool once and then use the same pool in all
# future calls.
redis = None


async def redis_pool():
    # there's probably a better way of doing this without global
    global redis
    if redis == None:
        # print("create pool")
        redis = await create_pool(ARQ_REDIS)
    return redis
