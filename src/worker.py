import arq
import logging

from app import expire_discussion
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
    functions = [expire_discussion]
