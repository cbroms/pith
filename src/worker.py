import arq
import constants
import socketio
import asyncio

from arq.worker import run_worker
from json import dumps
from pymongo import MongoClient
from utils.utils import UUIDEncoder
from arq.connections import RedisSettings


client = MongoClient(constants.MONGO_CONN)

discussions = client["db"]["discussions"]
external_sio = socketio.AsyncRedisManager(constants.SOCKET_REDIS, write_only=True)


async def expire_discussion(ctx, discussion_id):
    discussions.update_one(
        {"_id": discussion_id},
        {"$set": {"expired": True}}
    )
    serialized = dumps({"discussion_id": discussion_id}, cls=UUIDEncoder)
    await external_sio.emit("discussion_expired", serialized)
    return


async def startup(ctx):
    print("starting new worker")
    return


async def shutdown(ctx):
    print("shutting down worker")
    return


class WorkerSettings(arq.worker.Worker):
    redis_settings = constants.ARQ_REDIS
    max_jobs = constants.MAX_JOBS
    max_tries = constants.MAX_QUEUED_JOB_RETRIES
    on_startup = startup
    on_shutdown = shutdown
    functions = [expire_discussion]


if __name__ == '__main__':
    try:
        asyncio.run(run_worker(WorkerSettings))
    except:
        pass
