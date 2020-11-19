import arq
import logging
logging.basicConfig(level=logging.DEBUG)

from worker.worker_functions import test  
import constants


async def startup(ctx):
    logging.info("Starting new worker...")


async def shutdown(ctx):
    logging.info("Shutting down worker...")


class WorkerSettings(arq.worker.Worker):
    redis_settings = constants.ARQ_REDIS
    max_jobs = constants.MAX_JOBS
    max_tries = constants.MAX_QUEUED_JOB_RETRIES
    on_startup = startup
    on_shutdown = shutdown
    functions = [test]
