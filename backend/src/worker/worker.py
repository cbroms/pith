import arq
import logging
logging.basicConfig(level=logging.DEBUG)

from managers.global_manager import (
  GlobalManager,
  update_board_job,
)
import constants


async def startup(ctx):
    logging.info("Starting new worker...")
    # dedicate a manager for the worker
    ctx["manager"] = GlobalManager()
    ctx["manager"].start()

async def shutdown(ctx):
    logging.info("Shutting down worker...")


class WorkerSettings(arq.worker.Worker):
    redis_settings = constants.ARQ_REDIS
    max_jobs = constants.MAX_JOBS
    max_tries = constants.MAX_QUEUED_JOB_RETRIES
    on_startup = startup
    on_shutdown = shutdown
    functions = [update_board_job]
