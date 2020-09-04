from arq import create_pool
import asyncio

import constants

loop = asyncio.get_event_loop()
redis_queue = loop.run_until_complete(create_pool(constants.ARQ_REDIS))
