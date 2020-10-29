from aiohttp import web
from json import dumps
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from socketio import AsyncNamespace
from functools import wraps
import inspect
import logging

import constants
from error import Errors
from managers.global_manager import GlobalManager
import schema.board_responses as bres
import schema.discussion_requests as dreq
import schema.discussion_responses as dres
from utils.utils import DictEncoder, GenericEncoder, sum_dicts


logging.basicConfig(level=logging.DEBUG)#filename=constants.LOG_FILENAME, level=logging.DEBUG)
gm = GlobalManager()
sio = gm.sio

def autolog(message):
    "Automatically log the current function details."
		# get previous frame
    func = inspect.currentframe().f_back.f_code
    # Dump the message + the name of this function to the log.
    logging.debug("{}:{}:{}: {}".format(
        func.co_filename, 
        func.co_name, 
        func.co_firstlineno,
        message
    ))


@sio.on('create')
async def on_create(sid, request):
    """
    :return: :ref:`bres_created-label`
    :errors: BAD_RESPONSE 
    """
    result = await gm.discussion_manager.create()

    if not "error" in result:
      try:
        validate(instance=serialized, schema=bres.created)
      except ValidationException:
        result = {"error": Errors.BAD_RESPONSE}
    serialized = dumps(result, cls=GenericEncoder)
    return serialized

class DiscussionNamespace(AsyncNamespace):
    """
    Namespace functions for the discussion abstraction.
    """

    def _is_error(src):
        return "error" in src

    def _validate_request(req):
      def outer(func):
        @wraps(func)
        async def helper(self, sid, request): # TODO
          try:
            validate(instance=request, schema=dreq.schema[req])
            return await func
          except ValidationException:
            return {"error": Errors.BAD_REQUEST}
        return helper
      return outer

    def _process_responses(ret=None, emits=None):
      def outer(func):
        @wraps(func)
        async def helper(self, sid, request): # TODO
					# every function should have a discussion id
          try:
            session = await self.get_session(sid)
            discussion_id = session["discussion_id"]
          except Exception:
            logging.exception(Errors.SERVER_ERROR.value) # TODO
            return # invalid

          result = None
          product = await func(self, sid, request)

          if self._is_error(result):
            result = product
          else:
            ret_res, emits_res = product
            emits_res = (dumps(e, cls=DictEncoder) for r in emits_res)

            bad_response = False
            if ret is not None:
              try:
                validate(instance=ret_res, schema=dres.schema[ret])
                result = ret_res
              except ValidationException:
                bad_response = True

            if emits is not None:
              for r, e in zip(emits_res, emits):
                try:
                  validate(instance=r, schema=dres.schema[e])
                except ValidationException:
                  bad_response = True

            if bad_response:
              result = {"error": Errors.BAD_RESPONSE}

            # send off emits
            for r, e in zip(emits_res, emits):
              serialized = dumps(r, cls=GenericEncoder)
              await self.emit(e, serialized, room=discussion_id)

          # send off return          
          if result is not None:
            serialized = dumps(result, cls=GenericEncoder)
            return serialized

        return helper
      return outer

    # wrapped within response so error is processed
    def _check_user_session(func):
      async def helper(self, sid, request): # TODO
        if "joined" in session:
          try:
            session = await self.get_session(sid)
            discussion_id = session["discussion_id"]
            user_id = session["user_id"]
          except Exception:
            logging.exception(Errors.SERVER_ERROR.value) # TODO
          return await func(self, sid, request)
        else:
            return {"error": Errors.INVALID_USER_SESSION}
        return helper

    async def on_connect(self, sid, environ):
      pass

    async def on_disconnect(self, sid):
      # may return error, but we do not report back
      self.on_leave(self, sid, {})

    @_process_responses(ret="created_user")
    @_check_user_session
    @_validate_request("create_user")
    async def on_create_user(self, sid, request):
        """
        :event: :ref:`dreq_create_user-label`
        :return: :ref:`dres_created_user-label` 
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, NICKNAME_EXISTS, USER_ID_EXISTS 
        """
        discussion_id = request["discussion_id"]
        nickname = request["nickname"]
        user_id = None
        if "user_id" in request:
          user_id = request["user_id"]

        result = gm.discussion_manager.create_user(
          discussion_id=discussion_id,
          nickname=nickname,
          user_id=user_id
        )

				# save, regardless of outcome
				await self.save_session(sid, {
					"discussion_id": discussion_id, 
				})

        return result

    @_process_responses(emits=("joined_user"))
    @_check_user_session
    @_validate_request("join")
    async def on_join(self, sid, request):
        """
        :event: :ref:`dreq_join-label`
        :emit: *joined_user* (:ref:`dres_joined_user-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID 
        """
        discussion_id = request["discussion_id"]
        user_id = request["user_id"]

        result = gm.discussion_manager.join(
          discussion_id=discussion_id, 
          user_id=user_id
        )

				# save, regardless of outcome
				await self.save_session(sid, {
					"discussion_id": discussion_id, 
				})
        # result is successful
        if self._is_error(result):
          self.enter_room(sid, discussion_id)
          await self.save_session(sid, {
            "joined": True,
            "user_id": user_id}
          )

        return result

    # REFACTOR SERIALIZATION HERE

    async def on_leave(self, sid, request):
        """
        :emit: *left_user* (:ref:`dres_left_user-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.leave(
          discussion_id=discussion_id, 
          user_id=user_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.left_user):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("left_user", serialized, room=discussion_id)
        self.leave_room(sid, discussion_id)

    async def on_load_user(self, sid, request):
        """
        :return: :ref:`dres_loaded_user-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID
        """
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.load_user(
          discussion_id=discussion_id, 
          user_id=user_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.loaded_user):
          return {"error": Errors.BAD_RESPONSE.value}
        return serialized
    
    async def on_load_unit_page(self, sid, request):
        """
        :event: :ref:`dreq_load_unit_page-label`
        :emit: *moved_cursor* (:ref:`dres_moved_cursor-label`)
        :return: :ref:`dres_loaded_unit_page-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID
        """
        if validate(instance=request, schema=dreq.load_unit_page):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.load_unit_page(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        unit_page, cursor = result

        # do cursor first
        serialized = dumps(cursor, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.moved_cursor):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("moved_cursor", serialized, room=discussion_id)

        serialized = dumps(unit_page, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.loaded_unit_page):
          return {"error": Errors.BAD_RESPONSE.value}
        return serialized

    async def on_get_ancestors(self, sid, request):
        """
        :event: :ref:`dreq_get_ancestors-label`
        :return: :ref:`dres_get_ancestors-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        if validate(instance=request, schema=dreq.get_ancestors):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.get_ancestors(
          discussion_id=discussion_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.get_ancestors):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("edited_unit", serialized, room=discussion_id)
        return serialized

    async def on_get_unit_content(self, sid, request):
        """
        :event: :ref:`dreq_get_unit_content-label`
        :return: :ref:`dres_get_unit_content-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        if validate(instance=request, schema=dreq.get_unit_content):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.get_unit_content(
          discussion_id=discussion_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.get_unit_content):
          return {"error": Errors.BAD_RESPONSE.value}
        return serialized

    async def on_get_unit_context(self, sid, request):
        """
        :event: :ref:`dreq_get_unit_context-label`
        :return: :ref:`dres_get_unit_context-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        if validate(instance=request, schema=dreq.get_unit_context):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.get_unit_context(
          discussion_id=discussion_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.get_unit_context):
          return {"error": Errors.BAD_RESPONSE.value}
        return serialized

    async def on_post(self, sid, request):
        """
        :event: :ref:`dreq_post-label`
        :emit: *created_post* (:ref:`dres_created_post-label`) AND *added_backlinks* (:ref:`dres_added_backlinks-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID
        """
        if validate(instance=request, schema=dreq.post):
          return {"error": Errors.BAD_REQUEST.value}
        pith = request["pith"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.post(
          discussion_id=discussion_id, 
          user_id=user_id, 
          pith=pith
        )

        if "error" in result:
          return result
        created_post, added_backlinks = result
        serialized = dumps(created_post, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.created_post):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("created_post", serialized, room=discussion_id)

        serialized = dumps(added_backlinks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_backlinks):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("added_backlinks", serialized, room=discussion_id)

    async def on_search(self, sid, request):
        """
        :event: :ref:`dreq_search-label`
        :return: :ref:`dres_search-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID
        """
        if validate(instance=request, schema=dreq.search):
          return {"error": Errors.BAD_REQUEST.value}
        query = request["query"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.search(
          discussion_id=discussion_id, 
          query=query
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.search):
          return {"error": Errors.BAD_RESPONSE.value}
        return serialized

    async def on_send_to_doc(self, sid, request):
        """
        :event: :ref:`dreq_send_to_doc-label`
        :emit: *added_unit* (:ref:`dres_added_unit-label`) AND *added_backlinks* (:ref:`dres_added_backlinks-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        if validate(instance=request, schema=dreq.send_to_doc):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.send_to_doc(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        added_unit, added_backlinks = result
        serialized = dumps(added_unit, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_unit):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("added_unit", serialized, room=discussion_id)

        serialized = dumps(added_backlinks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_backlinks):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("added_backlinks", serialized, room=discussion_id)

    async def on_move_cursor(self, sid, request): 
        """
        :event: :ref:`dreq_move_cursor-label`
        :emit: *moved_cursor* (:ref:`dres_moved_cursor-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, BAD_POSITION
        """
        if validate(instance=request, schema=dreq.moved_cursor):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        position = request["position"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.move_cursor(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id, 
          position=position
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.moved_cursor):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("moved_cursor", serialized, room=discussion_id)

    async def on_hide_unit(self, sid, request): 
        """
        NOTE: Call `request_to_edit` before this.

        :event: :ref:`dreq_hide_unit-label`
        :emit: *hid_unit* (:ref:`dres_hid_unit-label`) AND *unlocked_unit_editable* (:ref:`dres_unlocked_unit_editable-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID, BAD_EDIT_TRY
        """
        if validate(instance=request, schema=dreq.hide_unit):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.hide_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result 
        hide, unlocks = result
        # hide
        serialized = dumps(hide, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.hid_unit):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("hid_unit", serialized, room=discussion_id)
        # unlocks
        serialized = dumps(unlocks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.unlocked_unit_editable):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("unlocked_unit_editable", serialized, room=discussion_id)

    async def on_unhide_unit(self, sid, request): 
        """
        :event: :ref:`dreq_unhide_unit-label`
        :emit: *unhid_unit* (:ref:`dres_unhid_unit-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        if validate(instance=request, schema=dreq.unhide_unit):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.unhide_unit(
          discussion_id=discussion_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.unhid_unit):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("unhid_unit", serialized, room=discussion_id)

    async def on_add_unit(self, sid, request): 
        """
        :event: :ref:`dreq_add_unit-label`
        :emit: *added_unit* (:ref:`dres_added_unit-label`) AND *added_backlinks* (:ref:`dres_added_backlinks-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID
        """
        if validate(instance=request, schema=dreq.add_unit):
          return {"error": Errors.BAD_REQUEST.value}
        pith = request["pith"]
        parent = request["parent"]
        position = request["position"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.add_unit(
          discussion_id=discussion_id, 
          pith=pith, 
          parent=parent, 
          position=position
        )

        if "error" in result:
          return result
        added_unit, added_backlinks = result
        serialized = dumps(added_unit, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_unit):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("added_unit", serialized, room=discussion_id)

        serialized = dumps(added_backlinks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_backlinks):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("added_backlinks", serialized, room=discussion_id)

    async def on_select_unit(self, sid, request): 
        """
        :event: :ref:`dreq_select_unit-label`
        :emit: *locked_unit_position* (:ref:`dres_locked_unit_position-label`) 
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, FAILED_POSITION_ACQUIRE
        """
        if validate(instance=request, schema=dreq.select_unit):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.select_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.locked_unit_position):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("locked_unit_position", serialized, room=discussion_id)

    async def on_deselect_unit(self, sid, request): 
        """
        :event: :ref:`dreq_deselect_unit-label`
        :emit: *unlocked_unit_position* (:ref:`dres_unlocked_unit_position-label`) 
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, BAD_POSITION_TRY
        """
        if validate(instance=request, schema=dreq.deselect_unit):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.deselect_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.unlocked_unit_position):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("unlocked_unit_position", serialized, room=discussion_id)

    async def on_move_units(self, sid, request): 
        """
        NOTE: Call `select_unit` before this.

        :event: :ref:`dreq_move_units-label`
        :emit: *repositioned_unit* (:ref:`dres_repositioned_unit-label`) AND *unlocked_unit_position* (:ref:`dres_unlocked_unit_position-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, BAD_POSITION_TRY, BAD_PARENT
        """
        if validate(instance=request, schema=dreq.move_units):
          return {"error": Errors.BAD_REQUEST.value}
        units = request["units"]
        parent = request["parent"]
        position = request["position"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.move_units(
          discussion_id=discussion_id, 
          user_id=user_id, 
          units=units,
          parent=parent,
          position=position
        )

        if "error" in result:
          return result
        repositions, unlocks = result
        # repositions
        serialized = dumps(repositions, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.repositioned_unit):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("repositioned_unit", serialized, room=discussion_id)
        # unlocks
        serialized = dumps(unlocks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.unlocked_unit_position):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("unlocked_unit_position", serialized, room=discussion_id)

    async def on_merge_units(self, sid, request): 
        """
        NOTE: Call `select_unit` before this.

        :event: :ref:`dreq_merge_units-label`
        :emit: *repositioned_unit* (:ref:`dres_repositioned_unit-label`), *added_unit* (for parent unit, :ref:`dres_added_unit-label`) AND *unlocked_unit_position* (:ref:`dres_unlocked_unit_position-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, BAD_POSITION_TRY, BAD_PARENT
        """
        if validate(instance=request, schema=dreq.merge_units):
          return {"error": Errors.BAD_REQUEST.value}
        units = request["units"]
        parent = request["parent"]
        position = request["position"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.merge_units(
          discussion_id=discussion_id, 
          user_id=user_id, 
          units=units,
          parent=parent,
          position=position
        )

        if "error" in result:
          return result
        repositions, add, unlocks = result
        # give added first
        serialized = dumps(add, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_unit):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("added_unit", serialized, room=discussion_id)
        # repositions
        serialized = dumps(repositions, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.repositioned_unit):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("repositioned_unit", serialized, room=discussion_id)
        # unlocks
        serialized = dumps(unlocks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.unlocked_unit_position):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("unlocked_unit_position", serialized, room=discussion_id)

    async def on_request_to_edit(self, sid, request):
        """
        :event: :ref:`dreq_request_to_edit-label`
        :emit: *locked_unit_editable* (:ref:`dres_locked_unit_editable-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, FAILED_EDIT_ACQUIRE
        """
        if validate(instance=request, schema=dreq.request_to_edit):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.request_to_edit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.locked_unit_editable):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("locked_unit_editable", serialized, room=discussion_id)

    async def on_deedit_unit(self, sid, request):
        """
        :event: :ref:`dreq_deedit_unit-label`
        :emit: *unlocked_unit_editable* (:ref:`dres_unlocked_unit_editable-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, FAILED_EDIT_TRY
        """
        if validate(instance=request, schema=dreq.deedit_unit):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.deedit_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )

        if "error" in result:
          return result
        serialized = dumps(result, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.unlocked_unit_editable):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("unlocked_unit_editable", serialized, room=discussion_id)

    async def on_edit_unit(self, sid, request):
        """
        NOTE: Call `request_to_edit` before this.

        :event: :ref:`dreq_edit_unit-label`
        :emit: *edited_unit* (:ref:`dres_edited_unit-label`) AND *unlocked_unit_editable* (:ref:`dres_unlocked_unit_editable-label`) AND *removed_backlinks* (:ref:`dres_removed_backlinks-label`) AND *added_backlinks* (:ref:`dres_added_backlinks-label`) 
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, FAILED_EDIT_TRY
        """
        if validate(instance=request, schema=dreq.edit_unit):
          return {"error": Errors.BAD_REQUEST.value}
        unit_id = request["unit_id"]
        pith = request["pith"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.edit_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id, 
          pith=pith
        )

        if "error" in result:
          return result
        edited, unlocks, removed_backlinks, added_backlinks = result
        # edited
        serialized = dumps(edited, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.edited_unit):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("edited_unit", serialized, room=discussion_id)
        # unlocks
        serialized = dumps(unlocks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.unlocked_unit_editable):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("unlocked_unit_editable", serialized, room=discussion_id)
        # removed backlinks
        serialized = dumps(removed_backlinks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.removed_backlinks):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("removed_backlinks", serialized, room=discussion_id)
        # added backlinks
        serialized = dumps(added_backlinks, cls=GenericEncoder)
        if validate(instance=serialized, schema=dres.added_backlinks):
          return {"error": Errors.BAD_RESPONSE.value}
        await self.emit("added_backlinks", serialized, room=discussion_id)

# TODO: later people can add backlinks directly.

sio.register_namespace(DiscussionNamespace('/discussion'))

def main():
    gm.start()
    aio_app = gm.aio_app
    web.run_app(aio_app, port=constants.PORT)
 
if __name__ == '__main__':
    main()
