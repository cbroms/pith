"""
TODO: finish applying meta where needed. Consider if this is best method.
"""

from aiohttp import web
from json import dumps
from jsonschema import validate
import logging
from socketio import AsyncNamespace

import constants
import error
from managers.global_manager import GlobalManager
import schema.board_responses as bres
import schema.discussion_requests as dreq
import schema.discussion_responses as dres
from utils.utils import GenericEncoder, sum_dicts


gm = GlobalManager()
sio = gm.sio


@sio.on('create')
async def create(sid, request):
    """
    :return: :ref:`bres_create-label`
    """
    result, meta = await gm.discussion_manager.create()

    response = sum_dicts(result, meta)
    serialized = dumps(response, cls=GenericEncoder)
    if validate(instance=serialized, schema=bres.create):
      meta["error"] = error.BAD_RESPONSE
      return meta 
    return serialized

class DiscussionNamespace(AsyncNamespace):
    """
    Namespace functions for the discussion abstraction.
    """
    async def on_connect(self, sid, environ):
        pass

    async def on_disconnect(self, sid):
        session = await self.get_session(sid)
        discussion_id = session["active_discussion_id"]
        user_id = session["user_id"]
        if discussion_id:
          gm.discussion_manager.leave(discussion_id, user_id)

    async def create_user(self, sid, request):
        """
        :event: :ref:`dreq_create_user-label`
        :return: :ref:`dres_create_user-label` 
        """
        if validate(instance=request, schema=dreq.create_user):
          return {"error": error.BAD_REQUEST}
        discussion_id = request["discussion_id"]
        nickname = request["nickname"]

        result, meta = gm.discussion_manager.create_user(discussion_id, nickname)

        if meta["error"] != error.SUCCESS:
          return meta 
        response = sum_dicts(result, meta)
        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.create_user):
          meta["error"] = error.BAD_RESPONSE
          return meta 
        return serialized

    async def on_join(self, sid, request):
        """
        :event: :ref:`dreq_join-label`
        :emit: *joined_user* (:ref:`dres_join-label`)
        """
        if validate(instance=request, schema=dreq.join):
          return {"error": error.BAD_REQUEST}
        discussion_id = request["discussion_id"]
        user_id = request["user_id"]

        result, meta = gm.discussion_manager.join(discussion_id, user_id)

        if meta["error"] != error.SUCCESS:
          return meta 
        response = sum_dicts(result, meta)
        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.join):
          meta["error"] = error.BAD_RESPONSE
          return meta
        self.enter_room(sid, discussion_id)
        await self.emit("joined_user", serialized, room=discussion_id)
        await self.save_session(sid, {
          "discussion_id": discussion_id, 
          "user_id": user_id}
        )

    async def on_leave(self, sid, request):
        """
        :emit: *left_user* (:ref:`dres_leave-label`)
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["discussion_id"]

        result, meta = gm.discussion_manager.leave(discussion_id, user_id)

        if meta["error"] != error.SUCCESS:
          return meta 
        response = sum_dicts(result, meta)
        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.leave):
          meta["error"] = error.BAD_RESPONSE
          return meta 
        await self.emit("left_user", serialized, room=discussion_id)
        self.leave_room(sid, discussion_id)

    async def load_unit(self, sid, request):
        """
        :return: :ref:`dres_load_unit-label`
        """
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        response = gm.discussion_manager.load(discussion_id, user_id)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.load_unit):
          return {"error": error.BAD_RESPONSE}
        return serialized
    
    async def get_unit_page(self, sid, request):
        """
        :event: :ref:`dreq_get_unit_page-label`
        :return: :ref:`dres_get_unit_page-label`
        """
        if validate(instance=request, schema=dreq.get_unit_page):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        response = gm.discussion_manager.get_unit_page(discussion_id, unit_id)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.get_unit_page):
          return {"error": error.BAD_RESPONSE}
        return serialized

    async def get_ancestors(self, sid, request):
        """
        :event: :ref:`dreq_get_ancestors-label`
        :return: :ref:`dres_get_ancestors-label`
        """
        if validate(instance=request, schema=dreq.get_ancestors):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        response = gm.discussion_manager.get_ancestors(discussion_id, unit_id)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.get_ancestors):
          return {"error": error.BAD_RESPONSE}
        await self.emit("edited_unit", serialized, room=discussion_id)
        return serialized

    async def get_unit_content(self, sid, request):
        """
        :event: :ref:`dreq_get_unit_content-label`
        :return: :ref:`dres_get_unit_content-label`
        """
        if validate(instance=request, schema=dreq.get_unit_content):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        response = gm.discussion_manager.get_unit_content(discussion_id, unit_id)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.get_unit_content):
          return {"error": error.BAD_RESPONSE}
        return serialized

    async def get_unit_context(self, sid, request):
        """
        :event: :ref:`dreq_get_unit_context-label`
        :return: :ref:`dres_get_unit_context-label`
        """
        if validate(instance=request, schema=dreq.get_unit_context):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        response = gm.discussion_manager.get_unit_context(discussion_id, unit_id)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.get_unit_context):
          return {"error": error.BAD_RESPONSE}
        return serialized

    async def post(self, sid, request):
        """
        :event: :ref:`dreq_post-label`
        :emit: *created_post* (:ref:`dres_post-label`)
        """
        if validate(instance=request, schema=dreq.post):
          return {"error": error.BAD_REQUEST}
        pith = request["pith"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        response = gm.discussion_manager.post(discussion_id, user_id, pith)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.post):
          return {"error": error.BAD_RESPONSE}
        await self.emit("created_post", serialized, room=discussion_id)

    async def on_search(self, sid, request):
        """
        :event: :ref:`dreq_search-label`
        :return: :ref:`dres_search-label`
        """
        if validate(instance=request, schema=dreq.search):
          return {"error": error.BAD_REQUEST}
        query = request["query"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        response = gm.discussion_manager.search(discussion_id, query)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.search):
          return {"error": error.BAD_RESPONSE}
        return serialized

    async def send_to_doc(self, sid, request):
        """
        :event: :ref:`dreq_send_to_doc-label`
        :emit: *added_unit* (:ref:`dres_added_unit-label`)
        """
        if validate(instance=request, schema=dreq.send_to_doc):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        response = gm.discussion_manager.send_to_doc(discussion_id, user_id, unit_id)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_unit):
          return {"error": error.BAD_RESPONSE}
        await self.emit("added_unit", serialized, room=discussion_id)

    async def move_cursor(self, sid, request): 
        """
        :event: :ref:`dreq_move_cursor-label`
        :emit: *moved_cursor* (:ref:`dres_move_cursor-label`)
        """
        if validate(instance=request, schema=dreq.move_cursor):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        position = request["position"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        response = gm.discussion_manager.move_cursor(discussion_id, user_id, unit_id, position)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.move_cursor):
          return {"error": error.BAD_RESPONSE}
        await self.emit("moved_cursor", serialized, room=discussion_id)

    async def hide_unit(self, sid, request): 
        """
        NOTE: Call `request_to_edit` before this.

        :event: :ref:`dreq_hide_unit-label`
        :emit: *hid_unit* (:ref:`dres_hide_unit-label`, edit lock released)
        """
        if validate(instance=request, schema=dreq.hide_unit):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        gm.discussion_manager.hide_unit(discussion_id, user_id, unit_id)
        response = {"unit_id": unit_id}

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.hide_unit):
          return {"error": error.BAD_RESPONSE}
        await self.emit("hid_unit", serialized, room=discussion_id)

    async def unhide_unit(self, sid, request): 
        """
        :event: :ref:`dreq_unhide_unit-label`
        :emit: *unhid_unit* (:ref:`dres_unhide_unit-label`)
        """
        if validate(instance=request, schema=dreq.unhide_unit):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        gm.discussion_manager.hide_unit(discussion_id, unit_id)
        response = {"unit_id": unit_id}

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.unhide_unit):
          return {"error": error.BAD_RESPONSE}
        await self.emit("unhid_unit", serialized, room=discussion_id)

    async def add_unit(self, sid, request): 
        """
        :event: :ref:`dreq_add_unit-label`
        :emit: *added_unit* (:ref:`dres_added_unit-label`)
        """
        if validate(instance=request, schema=dreq.add_unit):
          return {"error": error.BAD_REQUEST}
        pith = request["pith"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        response = gm.discussion_manager.add_unit(discussion_id, user_id, pith)

        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_unit):
          return {"error": error.BAD_RESPONSE}
        await self.emit("added_unit", serialized, room=discussion_id)

    async def select_unit(self, sid, request): 
        """
        :event: :ref:`dreq_select_unit-label`
        :emit: *locked_unit_position* (:ref:`dres_locked_unit_position-label`, position lock taken) OR fail 
        """
        if validate(instance=request, schema=dreq.add_unit):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        response = gm.discussion_manager.select_unit(discussion_id, user_id, unit_id)

        if response is None:
          return False
        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.locked_unit_position):
          return {"error": error.BAD_RESPONSE}
        await self.emit("locked_unit_position", serialized, room=discussion_id)

    async def move_units(self, sid, request): 
        """
        NOTE: Call `select_unit` before this.

        :event: :ref:`dreq_move_units-label`
        :emit: *repositioned_unit* (:ref:`dres_repositioned_unit-label`, position lock released) OR fail
        """
        if validate(instance=request, schema=dreq.move_units):
          return {"error": error.BAD_REQUEST}
        units = request["units"]
        parent = request["parent"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        responses = gm.discussion_manager.move_units(discussion_id, user_id, units, parent)

        if responses is None:
          return False
        serialized = dumps(responses, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.repositioned_unit):
          return {"error": error.BAD_RESPONSE}
        await self.emit("repositioned_unit", serialized, room=discussion_id)

    async def merge_units(self, sid, request): 
        """
        NOTE: Call `select_unit` before this.

        :event: :ref:`dreq_merge_units-label`
        :emit: *repositioned_unit* (:ref:`dres_repositioned_unit-label`, position lock released) AND *added_unit* (for parent unit, :ref:`dres_added_unit-label`) OR fail 
        """
        if validate(instance=request, schema=dreq.merge_units):
          return {"error": error.BAD_REQUEST}
        units = request["units"]
        parent = request["parent"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        responses = gm.discussion_manager.merge_units(discussion_id, user_id, units, parent)

        if responses is None:
          return False
        repositions, add = responses
        # give added first
        serialized = dumps(add, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_unit):
          return {"error": error.BAD_RESPONSE}
        await self.emit("added_unit", serialized, room=discussion_id)
        # repositions
        serialized = dumps(repositions, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.repositioned_unit):
          return {"error": error.BAD_RESPONSE}
        await self.emit("repositioned_unit", serialized, room=discussion_id)

    async def request_to_edit(self, sid, request):
        """
        :event: :ref:`dreq_request_to_edit-label`
        :emit: *locked_unit_editable* (:ref:`dres_locked_unit_editable-label`, edit lock taken) OR fail
        """
        if validate(instance=request, schema=dreq.request_to_edit):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        response = gm.discussion_manager.request_to_edit(discussion_id, user_id, unit_id)

        if response is None:
          return False
        serialized = dumps(response, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.locked_unit_editable):
          return {"error": error.BAD_RESPONSE}
        await self.emit("locked_unit_editable", serialized, room=discussion_id)

    async def edit_unit(self, sid, request):
        """
        NOTE: Call `request_to_edit` before this.

        :event: :ref:`dreq_edit_unit-label`
        :emit: *edited_unit* (:ref:`dres_edited_unit-label`, edit lock released) AND OPT *removed_backlink* (:ref:`dres_removed_backlink-label`) AND OPT *added_backlink* (:ref:`dres_added_backlink-label`) 
        """
        if validate(instance=request, schema=dreq.edit_unit):
          return {"error": error.BAD_REQUEST}
        unit_id = request["unit_id"]
        pith = request["pith"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        responses = gm.discussion_manager.edit_unit(discussion_id, user_id, unit_id, pith)

        if responses is None:
          return False
        edited, removed_backlinks, added_backlinks = responses
        # edited
        serialized = dumps(edited, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.edited_unit):
          return {"error": error.BAD_RESPONSE}
        await self.emit("edited_unit", serialized, room=discussion_id)
        # removed backlinks
        if removed_backlinks:
          serialized = dumps(removed_backlinks, cls=GenericEncoder)
          if validate(instance=serialized, schema=dres.removed_backlink):
            return {"error": error.BAD_RESPONSE}
          await self.emit("removed_backlink", serialized, room=discussion_id)
        # added backlinks
        if added_backlinks:
          serialized = dumps(added_backlinks, cls=GenericEncoder)
          if validate(instance=serialized, schema=dres.added_backlink):
            return {"error": error.BAD_RESPONSE}
          await self.emit("added_backlink", serialized, room=discussion_id)

# TODO: later people can add backlinks directly.

sio.register_namespace(DiscussionNamespace('/discussion'))

def main():
    gm.start()
    logging.basicConfig(level=logging.DEBUG)
    aio_app = gm.aio_app
    web.run_app(aio_app, port=constants.PORT)
 
if __name__ == '__main__':
    main()
