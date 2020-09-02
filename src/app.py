import constants
import logging

from aiohttp import web
from json import dumps
from socketio import AsyncNamespace
from uuid import UUID

from managers.global_manager import GlobalManager
from utils.utils import UUIDEncoder

gm = GlobalManager()
sio = gm.sio
app = gm.app

aio_app = web.Application()
sio.attach(aio_app)
logging.basicConfig(level=logging.DEBUG)


# TODO board namespace

# TODO need to rethink how to reconcile with discussion connect
@sio.on('connect')
async def connect(sid, environ):
  user_id = sid # TODO placeholder
  await sio.save_session(sid, {'user_id': user_id, 'active_discussion_id': None})


@sio.on('disconnect')
async def disconnect(sid):
  pass


@sio.on('create')
async def create(sid, json):
    """
    :param title:
    :type title: str
    :param theme:
    :type theme: str
    :param time_limit: seconds
    :type time_limit: int

    :return: **discussion_id**
    :rtype: str
    emit: created
    """
    title = json["title"]
    theme = json["theme"]
    time_limit = json["time_limit"] if "time_limit" in json else None
    block_char_limit = json["block_char_limit"] if "block_char_limit" in json else None
    summary_char_limit = json["summary_char_limit"] if "summary_char_limit" in json else None
    discussion_id = gm.discussion_manager.create( # TODO await
        title,
        theme,
        time_limit,
        block_char_limit,
        summary_char_limit,
    )
    serialized = dumps(discussion_id, cls=UUIDEncoder)
    await sio.emit("created", serialized)
    return serialized

@sio.on('remove')
async def remove(sid, json):
    """
    :param discussion_id:
    :type discussion_id: str
    """
    discussion_id = json["discussion_id"]
    gm.discussion_manager.remove(discussion_id)

# TODO User-based functions.

# TODO NEED TO RECONCILE WITH CONNECT
@sio.on('create_user')
async def create_user(sid, json):
    """
    :param user_id: 
    :type user_id: str
    """
    session = await sio.get_session(sid)
    user_id = session["user_id"]
    gm.user_manager.create(user_id)


class DiscussionNamespace(AsyncNamespace):
    """
    Namespace functions for the discussion abstraction.
    """
    async def on_connect(self, sid, environ):
        user_id = sid # TODO placeholder

        # TODO temporary solution
        gm.user_manager.create(user_id)

        await self.save_session(sid, {'user_id': user_id, 'active_discussion_id': None})

    async def on_disconnect(self, sid):
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        user_id = session["user_id"]
        if discussion_id:
          gm.discussion_manager.leave(discussion_id, user_id)

    async def on_get(self, sid):
        """
        :return: **discussion_ids** 
        :rtype: List[str]
        """
        discussion_ids = gm.discussion_manager.get_all()
        return dumps(discussion_ids, cls=UUIDEncoder)

    async def on_get_posts(self, sid, json):
        """
        :param discussion_id:
        :type discussion_id: str

        :returns:
          - **post_id** (*str*) -
          - **author** (*str*) -
          - **author_name** (*str*) -
          - **created_at** (*str*) -
          - **blocks** (*List[str]*) -
        """
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        posts_info = gm.discussion_manager.get_posts_flattened(discussion_id)
        return dumps(posts_info, cls=UUIDEncoder)

    async def on_join(self, sid, json):
        """
        :param discussion_id:
        :type discussion_id: str
        :param user_id:
        :type user_id: str
        :param name:
        :type name: str

        :returns:
          - **discussion_id** (*str*) -
          - **title** (*str*) -
          - **theme** (*str*) -
          - **num_users** (*int*) -
        :emit: joined
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = json["discussion_id"]
        name = json["name"]
        info = gm.discussion_manager.join(discussion_id, user_id, name)
        if info is not None:
            await sio.save_session(sid, {'active_discussion_id': discussion_id})
            serialized = dumps(info, cls=UUIDEncoder)
            self.enter_room(sid, discussion_id)
            await self.emit("joined", serialized, room=discussion_id)
            return serialized
        return None

    async def on_leave(self, sid, json):
        """
        :param discussion_id:
        :type discussion_id: str
        :param user_id:
        :type user_id: str

        :returns:
          - **discussion_id** (*str*) - 
          - **num_users** (*int*) - 
        :emit: left
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        info = gm.discussion_manager.leave(discussion_id, user_id)
        await sio.save_session(sid, {'active_discussion_id': None})
        serialized = dumps(info, cls=UUIDEncoder)
        self.leave_room(sid, discussion_id)
        await self.emit("left", serialized, room=discussion_id)
        return serialized

    async def on_get_num_users(self, sid, json):
        """
        :param discussion_id:
        :type discussion_id: str
        :param user_id:
        :type user_id: str
        :param blocks:
        :type blocks: List[str]

        :return: **num_users**
        :rtype: int
        """
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        num_users = gm.discussion_manager.get_num_users(discussion_id)
        serialized = dumps({"num_users": num_users}, cls=UUIDEncoder)
        return serialized

    async def on_create_post(self, sid, json):
        """
        :param discussion_id:
        :type discussion_id: str
        :param user_id:
        :type user_id: str
        :param blocks:
        :type blocks: List[str]

        :returns:
          - **post_id** (*str*) -
          - **blocks** (*List[str]*) - 
        :emit: created_post
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        blocks = json["blocks"]
        post_info = gm.discussion_manager.create_post(discussion_id, user_id, blocks)
        serialized = dumps(post_info, cls=UUIDEncoder)
        await self.emit("created_post", serialized, room=discussion_id)
        return serialized

    async def on_get_block(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param block_id: 
        :type block_id: str

        Output: block_info: {
        :results:
          - **block_id** (*str*) - 
          - **body** (*str*) - 
          - **tags** (*str*)
            - **owner** (*str*) 
        """
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        block_id = json["block_id"]
        block_data = gm.discussion_manager.get_block_flattened(discussion_id, block_id)
        return dumps(block_data, cls=UUIDEncoder)

    async def on_save_block(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param user_id: 
        :type user_id: str
        :param block_id: 
        :type block_id: str

        :return: **block_id**
        :rtype: str 
        :emit: saved_block
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        block_id = json["block_id"]
        gm.user_manager.save_block(user_id, discussion_id, block_id)
        serialized = dumps({"block_id": block_id}, cls=UUIDEncoder)
        await self.emit("saved_block", serialized, to=sid)
        return serialized

    async def on_unsave_block(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param user_id: 
        :type user_id: str
        :param block_id: 
        :type block_id: str

        :return: **block_id**
        :rtype: str 
        :emit: unsaved_block
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        block_id = json["block_id"]
        gm.user_manager.unsave_block(user_id, discussion_id, block_id)
        serialized = dumps({"block_id": block_id}, cls=UUIDEncoder)
        await self.emit("unsaved_block", serialized, to=sid)
        return serialized

    async def on_get_saved_blocks(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param user_id: 
        :type user_id: str

        :return: **block_ids**
        :rtype: List[str]
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        block_ids = gm.user_manager.get_user_saved_block_ids(user_id, discussion_id)
        return dumps(block_ids, cls=UUIDEncoder)

    async def on_block_add_tag(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param user_id: 
        :type user_id: str
        :param block_id: 
        :type block_id: str
        :param tag: 
        :type tag: str

        :returns:
          - **block_id** (*str*) -
          - **user_id** (*str*) - 
          - **tag** (*str*) - 
        :emit: tagged_block
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        block_id = json["block_id"]
        tag = json["tag"]
        gm.discussion_manager.block_add_tag(discussion_id, user_id, block_id, tag)
        serialized = dumps({"block_id": block_id, "user_id": user_id, "tag": tag},
                           cls=UUIDEncoder)
        await self.emit("tagged_block", serialized, room=discussion_id)
        return serialized

    async def on_block_remove_tag(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param user_id: 
        :type user_id: str
        :param block_id: 
        :type block_id: str
        :param tag: 
        :type tag: str

        :returns:
          - **block_id** (*str*) -
          - **tag** (*str*) - 
        :emit: untagged_block
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        block_id = json["block_id"]
        tag = json["tag"]
        gm.discussion_manager.block_remove_tag(discussion_id, user_id, block_id, tag)
        serialized = dumps({"block_id": block_id, "tag": tag},
                           cls=UUIDEncoder)
        await self.emit("untagged_block", serialized, room=discussion_id)
        return serialized

    async def on_search_basic(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param query: 
        :type query: str

        :return: **blocks**
        :rtype: List[str]
        """
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        query = json["query"]
        result = gm.discussion_manager.discussion_scope_search(discussion_id, query)
        serialized = dumps(result, cls=UUIDEncoder)
        return serialized

    async def on_search_tags(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param tags: 
        :type tags: List[str]

        :return: **blocks**
        :rtype: List[str]
        """
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        tags = json["tags"]
        result = gm.discussion_manager.discussion_tag_search(discussion_id, tags)
        serialized = dumps(result, cls=UUIDEncoder)
        return serialized

    async def on_search_user_saved_basic(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param user_id: 
        :type user_id: str
        :param query: 
        :type query: str

        :return: **blocks**
        :rtype: List[str]
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        query = json["query"]
        result = gm.discussion_manager.user_saved_scope_search(discussion_id, user_id, query)
        serialized = dumps(result, cls=UUIDEncoder)
        return serialized

    async def on_search_user_saved_tags(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param user_id: 
        :type user_id: str
        :param tags: 
        :type tags: List[str]

        :return: **blocks**
        :rtype: List[str]
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["active_discussion_id"]
        tags = json["tags"]
        result = gm.discussion_manager.user_saved_tag_search(discussion_id, user_id, tags)
        serialized = dumps(result, cls=UUIDEncoder)
        return serialized

    async def on_summary_add_block(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param body: 
        :type body: str

        :returns:
          - **block_id** (*str*) - 
          - **body** (*str*) - 

        :raises:
          - **-1**: D_S_B_C_BC
          - **-2**: D_S_B_C_SC
        :emit: added_summary_block
        """
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        body = json["body"]
        block_id, err = gm.discussion_manager.summary_add_block(discussion_id, body)
        if not err:
            serialized = {"block_id": block_id, "body": body}
            await self.emit("added_summary_block", serialized, room=discussion_id)
            return serialized
        else:
            serialized = {"err": err}
            return serialized

    async def on_summary_modify_block(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param block_id: 
        :type block_id: str
        :param body: 
        :type body: str

        :returns:
          - **block_id** (*str*) - 
          - **body** (*str*) - 

        :raises:
          - **-1**: D_S_B_C_BC
          - **-2**: D_S_B_C_SC
        :emit: modified_summary_block
        """
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        block_id = json["block_id"]
        body = json["body"]
        err = gm.discussion_manager.summary_modify_block(discussion_id, block_id, body)
        if not err:
            serialized = {"block_id": block_id, "body": body}
            await self.emit("modified_summary_block", serialized, room=discussion_id)
            return serialized
        else:
            serialized = {"err": err}
            return serialized

    async def on_summary_remove_block(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param block_id: 
        :type block_id: str

        :return: **block_id**
        :rtype: str
        :emit: removed_summary_block
        """
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        block_id = json["block_id"]
        gm.discussion_manager.summary_remove_block(discussion_id, block_id)
        serialized = {"block_id": block_id}
        await self.emit("removed_summary_block", serialized, room=discussion_id)
        return serialized

sio.register_namespace(DiscussionNamespace('/discussion'))

if __name__ == '__main__':
    web.run_app(aio_app, port=constants.PORT)
