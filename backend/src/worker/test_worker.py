import asyncio
from managers.global_manager import GlobalManager


gm = GlobalManager()
gm.start()

async def main():
    print("hi")
    await gm.discussion_manager.call_test()
    print("bye")

#asyncio.run(main())
if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
"""
try:
    loop.run_until_complete(asyncio.wait([main()]))
except asyncio.CancelledError:
    print('Tasks has been canceled')
finally:
    loop.close()
"""
