import arq

from managers.global_manager import (
  GlobalManager,
  update_board_job,
)
import constants
from utils import utils


async def startup(ctx):
    utils.logging.info("Starting new worker...")
    # dedicate a manager for the worker
    ctx["cursor"] = utils.get_time()
    ctx["manager"] = GlobalManager()
    ctx["manager"].start() # no Redis

async def shutdown(ctx):
    utils.logging.info("Shutting down worker...")


class WorkerSettings(arq.worker.Worker):
    redis_settings = constants.ARQ_REDIS
    max_jobs = constants.MAX_JOBS
    max_tries = constants.MAX_QUEUED_JOB_RETRIES
    on_startup = startup
    on_shutdown = shutdown
    cron_jobs = [
      arq.cron(update_board_job, second={0, 10, 20, 30, 40, 50})
    ]
