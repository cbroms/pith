from json import dumps
from managers.global_manager import GlobalManager


gm = GlobalManager()
gm.start()
sio = gm.sio

async def test(ctx, x):
  print("in test", x)
  return gm.discussion_manager.test(x)
