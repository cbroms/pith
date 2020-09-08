from json import dumps
from managers.global_manager import GlobalManager


gm = GlobalManager()
gm.start()
sio = gm.sio


async def expire_discussion(ctx, discussion_id):
    response = gm.discussion_manager.expire(discussion_id)
    serialized = dumps(response, cls=GenericEncoder)
    await sio.emit("discussion_expired", serialized)
