from aiohttp import web
from json import dumps, loads
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from socketio import AsyncNamespace
from functools import wraps

import constants
from error import Errors
from managers.global_manager import GlobalManager
import schema.board_responses as bres
import schema.discussion_requests as dreq
import schema.discussion_responses as dres
from utils.utils import (
  logger,
  is_error, 
  make_error,
  DictEncoder, 
  ErrorEncoder,
  sum_dicts, 
)


gm = GlobalManager()
sio = gm.sio


# have checkers later
@sio.on('create')
async def on_create(sid, request):
    """
    :return: :ref:`bres_created-label`
    :errors: BAD_RESPONSE 
    """
    result = await gm.discussion_manager.create()

    if not is_error(result):
      try:
        validate(instance=result, schema=bres.created)
        serialized = dumps(result, cls=DictEncoder)
      except ValidationError:
        serialized = make_error(Errors.BAD_RESPONSE)
    return serialized

class DiscussionNamespace(AsyncNamespace):
    """
    Namespace functions for the discussion abstraction.
    """

    def _process_responses(ret=None, emits=None):
      def outer(func):
        @wraps(func)
        async def helper(self, sid, request):
          result = None
          product = await func(self, sid, request)

          # every function should have a discussion id
          session = await self.get_session(sid)
          discussion_id = session["discussion_id"]

          if is_error(product):
            result = product
          else:
            ret_res, emits_res = product

            bad_response = False

            if ret is not None:
              try:
                validate(instance=ret_res, schema=dres.schema[ret])
                result = ret_res
              except ValidationError:
                bad_response = True

            if emits is not None:
              assert(emits_res is not None)
              for r, e in zip(emits_res, emits):
                try:
                  validate(instance=r, schema=dres.schema[e])
                except ValidationError:
                  bad_response = True

            if bad_response: # we cannot send off emits
              result = make_error(Errors.BAD_RESPONSE)
            else: # we can send off emits

              if result is None:
                result = {"success": 0} # to avoid null
              result = dumps(result, cls=DictEncoder)

              if emits is not None:
                assert(emits_res is not None)
                for r, e in zip(emits_res, emits):
                  serialized = dumps(r, cls=DictEncoder)
                  await self.emit(e, serialized, room=discussion_id)

          return result
        return helper
      return outer

    # wrapped within response so error is processed
    def _check_user_session(func):
      async def helper(self, sid, request):
        try:
          session = await self.get_session(sid)
          discussion_id = session["discussion_id"]
          user_id = session["user_id"]
        except Exception:
            return make_error(Errors.INVALID_USER_SESSION)
        return await func(self, sid, request)
      return helper

    def _validate_request(req):
      def outer(func):
        @wraps(func)
        async def helper(self, sid, request):
          try:
            validate(instance=request, schema=dreq.schema[req])
            return await func(self, sid, request)
          except ValidationError:
            return make_error(Errors.BAD_REQUEST)
        return helper
      return outer

    async def on_connect(self, sid, environ):
      # does not do anything
      pass

    async def on_disconnect(self, sid):
      # may return error, but we do not report back
      await self.on_leave(sid, {})

    @_process_responses()
    @_validate_request("test_connect")
    async def on_test_connect(self, sid, request):
        """
        :event: :ref:`dreq_create_user-label`
        :errors: BAD_REQUEST, BAD_DISCUSSION_ID
        """
        discussion_id = request["discussion_id"]
        result = gm.discussion_manager.test_connect(
          discussion_id=discussion_id,
        )

        # save, regardless of outcome
        await self.save_session(sid, {
          "discussion_id": discussion_id, 
        })

        # if result is None, we send back success
        return result

    @_process_responses(ret="created_user")
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
        return result

    @_process_responses(emits=["joined_user"])
    @_validate_request("join")
    async def on_join(self, sid, request):
        """
        :event: :ref:`dreq_join-label`
        :emit: *joined_user* (:ref:`dres_joined_user-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID 
        """
        user_id = request["user_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.join(
          discussion_id=discussion_id, 
          user_id=user_id
        )

        # result is successful, joined means we are in room
        if not is_error(result):
          # resave discussion ID, as this replaces user session
          await self.save_session(sid, {
            "joined": True,
            "user_id": user_id,
            "discussion_id": discussion_id
          })
          self.enter_room(sid, discussion_id)
          # need to enter before can emit

        return result

    # this function has to be handled manually
    async def on_leave(self, sid, request):
        """
        :emit: *left_user* (:ref:`dres_left_user-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID
        """
        result = {"success": 0} # assume success
        session = await self.get_session(sid)

        # joined means we are in room and need to leave
        if "joined" in session:
          discussion_id = session["discussion_id"]
          user_id = session["user_id"]
          product = gm.discussion_manager.leave(
            discussion_id=discussion_id, 
            user_id=user_id
          )

          ret, emits = product

          try:
            validate(instance=emits[0], schema=dres.schema["left_user"])
            serialized = dumps(emits[0], cls=DictEncoder)
            await self.emit("left_user", serialized, room=discussion_id)
            # leave room when done with emit
            self.leave_room(sid, discussion_id)
          except ValidationError:
            bad_response = True
            result = make_error(Errors.BAD_RESPONSE)

        return result

    @_process_responses(ret="loaded_user")
    @_check_user_session
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
        return result
    
    @_process_responses(ret="loaded_unit_page", emits=["moved_cursor"])
    @_validate_request("load_unit_page")
    @_check_user_session
    async def on_load_unit_page(self, sid, request):
        """
        :event: :ref:`dreq_load_unit_page-label`
        :emit: *moved_cursor* (:ref:`dres_moved_cursor-label`)
        :return: :ref:`dres_loaded_unit_page-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.load_unit_page(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(ret="get_ancestors")
    @_validate_request("get_ancestors")
    @_check_user_session
    async def on_get_ancestors(self, sid, request):
        """
        :event: :ref:`dreq_get_ancestors-label`
        :return: :ref:`dres_get_ancestors-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.get_ancestors(
          discussion_id=discussion_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(ret="get_unit_content")
    @_validate_request("get_unit_content")
    @_check_user_session
    async def on_get_unit_content(self, sid, request):
        """
        :event: :ref:`dreq_get_unit_content-label`
        :return: :ref:`dres_get_unit_content-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.get_unit_content(
          discussion_id=discussion_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(ret="get_unit_context")
    @_validate_request("get_unit_context")
    @_check_user_session
    async def on_get_unit_context(self, sid, request):
        """
        :event: :ref:`dreq_get_unit_context-label`
        :return: :ref:`dres_get_unit_context-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.get_unit_context(
          discussion_id=discussion_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(emits=["created_post", "added_backlinks"])
    @_validate_request("post")
    @_check_user_session
    async def on_post(self, sid, request):
        """
        :event: :ref:`dreq_post-label`
        :emit: *created_post* (:ref:`dres_created_post-label`) AND *added_backlinks* (:ref:`dres_added_backlinks-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID
        """
        pith = request["pith"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.post(
          discussion_id=discussion_id, 
          user_id=user_id, 
          pith=pith
        )
        return result

    @_process_responses(ret="search")
    @_validate_request("search")
    @_check_user_session
    async def on_search(self, sid, request):
        """
        :event: :ref:`dreq_search-label`
        :return: :ref:`dres_search-label`
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID
        """
        query = request["query"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.search(
          discussion_id=discussion_id, 
          query=query
        )
        return result

    @_process_responses(emits=["added_unit", "added_backlinks"])
    @_validate_request("send_to_doc")
    @_check_user_session
    async def on_send_to_doc(self, sid, request):
        """
        :event: :ref:`dreq_send_to_doc-label`
        :emit: *added_unit* (:ref:`dres_added_unit-label`) AND *added_backlinks* (:ref:`dres_added_backlinks-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.send_to_doc(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(emits=["moved_cursor"])
    @_validate_request("move_cursor")
    @_check_user_session
    async def on_move_cursor(self, sid, request): 
        """
        :event: :ref:`dreq_move_cursor-label`
        :emit: *moved_cursor* (:ref:`dres_moved_cursor-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, BAD_POSITION
        """
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
        return result

    @_process_responses(emits=["hid_unit", "unlocked_unit_editable"])
    @_validate_request("hide_unit")
    @_check_user_session
    async def on_hide_unit(self, sid, request): 
        """
        NOTE: Call `request_to_edit` before this.

        :event: :ref:`dreq_hide_unit-label`
        :emit: *hid_unit* (:ref:`dres_hid_unit-label`) AND *unlocked_unit_editable* (:ref:`dres_unlocked_unit_editable-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID, BAD_EDIT_TRY
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.hide_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(emits=["unhid_unit"])
    @_validate_request("unhide_unit")
    @_check_user_session
    async def on_unhide_unit(self, sid, request): 
        """
        :event: :ref:`dreq_unhide_unit-label`
        :emit: *unhid_unit* (:ref:`dres_unhid_unit-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_UNIT_ID
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]

        result = gm.discussion_manager.unhide_unit(
          discussion_id=discussion_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(emits=["added_unit", "added_backlinks"])
    @_validate_request("add_unit")
    @_check_user_session
    async def on_add_unit(self, sid, request): 
        """
        :event: :ref:`dreq_add_unit-label`
        :emit: *added_unit* (:ref:`dres_added_unit-label`) AND *added_backlinks* (:ref:`dres_added_backlinks-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID
        """
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
        return result

    @_process_responses(emits=["locked_unit_position"])
    @_validate_request("select_unit")
    @_check_user_session
    async def on_select_unit(self, sid, request): 
        """
        :event: :ref:`dreq_select_unit-label`
        :emit: *locked_unit_position* (:ref:`dres_locked_unit_position-label`) 
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, FAILED_POSITION_ACQUIRE
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.select_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(emits=["unlocked_unit_position"])
    @_validate_request("deselect_unit")
    @_check_user_session
    async def on_deselect_unit(self, sid, request): 
        """
        :event: :ref:`dreq_deselect_unit-label`
        :emit: *unlocked_unit_position* (:ref:`dres_unlocked_unit_position-label`) 
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, BAD_POSITION_TRY
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.deselect_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(emits=["repositioned_unit", "unlocked_unit_position"])
    @_validate_request("move_units")
    @_check_user_session
    async def on_move_units(self, sid, request): 
        """
        NOTE: Call `select_unit` before this.

        :event: :ref:`dreq_move_units-label`
        :emit: *repositioned_unit* (:ref:`dres_repositioned_unit-label`) AND *unlocked_unit_position* (:ref:`dres_unlocked_unit_position-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, BAD_POSITION_TRY, BAD_PARENT
        """
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
        return result

    @_process_responses(emits=["repositioned_unit", "added_unit", "unlocked_unit_position"])
    @_validate_request("merge_units")
    @_check_user_session
    async def on_merge_units(self, sid, request): 
        """
        NOTE: Call `select_unit` before this.

        :event: :ref:`dreq_merge_units-label`
        :emit: *repositioned_unit* (:ref:`dres_repositioned_unit-label`), *added_unit* (for parent unit, :ref:`dres_added_unit-label`) AND *unlocked_unit_position* (:ref:`dres_unlocked_unit_position-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, BAD_POSITION_TRY, BAD_PARENT
        """
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
        return result

    @_process_responses(emits=["locked_unit_editable"])
    @_validate_request("request_to_edit")
    @_check_user_session
    async def on_request_to_edit(self, sid, request):
        """
        :event: :ref:`dreq_request_to_edit-label`
        :emit: *locked_unit_editable* (:ref:`dres_locked_unit_editable-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, FAILED_EDIT_ACQUIRE
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.request_to_edit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(emits=["unlocked_unit_editable"])
    @_validate_request("deedit_unit")
    @_check_user_session
    async def on_deedit_unit(self, sid, request):
        """
        :event: :ref:`dreq_deedit_unit-label`
        :emit: *unlocked_unit_editable* (:ref:`dres_unlocked_unit_editable-label`)
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, FAILED_EDIT_TRY
        """
        unit_id = request["unit_id"]
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]

        result = gm.discussion_manager.deedit_unit(
          discussion_id=discussion_id, 
          user_id=user_id, 
          unit_id=unit_id
        )
        return result

    @_process_responses(emits=["edited_unit", "unlocked_unit_editable", "removed_backlinks", "added_backlinks"])
    @_validate_request("edit_unit")
    @_check_user_session
    async def on_edit_unit(self, sid, request):
        """
        NOTE: Call `request_to_edit` before this.

        :event: :ref:`dreq_edit_unit-label`
        :emit: *edited_unit* (:ref:`dres_edited_unit-label`) AND *unlocked_unit_editable* (:ref:`dres_unlocked_unit_editable-label`) AND *removed_backlinks* (:ref:`dres_removed_backlinks-label`) AND *added_backlinks* (:ref:`dres_added_backlinks-label`) 
        :errors: BAD_REQUEST, BAD_RESPONSE, BAD_DISCUSSION_ID, BAD_USER_ID, BAD_UNIT_ID, FAILED_EDIT_TRY
        """
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
        return result

# TODO: later people can add backlinks directly.

sio.register_namespace(DiscussionNamespace('/discussion'))

def main():
    gm.start()
    aio_app = gm.aio_app
    web.run_app(aio_app, port=constants.PORT)
 
if __name__ == '__main__':
    main()
