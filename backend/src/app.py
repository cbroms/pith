from aiohttp import web
from json import dumps
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from socketio import AsyncNamespace
from functools import wraps

import constants
from error import Errors
from utils.utils import (
  get_room,
  logger,
  is_error, 
  make_error,
  DictEncoder,
)

from managers.global_manager import GlobalManager
import schema.board_requests as breq
import schema.board_responses as bres
import schema.discussion_requests as dreq
import schema.discussion_responses as dres


gm = GlobalManager()
sio = gm.sio


class BoardNamespace(AsyncNamespace):
    """
    Namespace functions for the board abstraction.
    """

    def _process_responses(name):
      def outer(func):
        @wraps(func)
        async def helper(self, sid, request):
          try:
            result = None
            logger.info("REQUEST\nfunc_name: {}\nrequest: {}\n".format(
              name, request
            ))
            product = await func(self, sid, request)
            logger.info("REQUEST\nfunc_name: {}\nproduct: {}\nrequest: {}\n".format(
              name, product, request
            ))
            if not is_error(product):
              try:
                validate(instance=product, schema=bres.schema[name])
                result = dumps(product, cls=DictEncoder)
              except ValidationError:
                logger.info("VALIDATION ERROR\nfunc_name: {}\nReturn response: {}\nReturn schema: {}\n".format(
                  name, product, name
                ))
                result = make_error(Errors.SERVER_ERR)
            else:
              logger.info("INPUT ERROR\nfunc_name: {}\nReturn response: {}".format(
                name, product
              ))
              result = product
          except Exception as e: # catch generic exceptions
            logger.info("GENERIC ERROR\nfunc_name: {}\nrequest: {}\nexception: {}\n".format(
              name, request, e
            ))
            result = make_error(Errors.SERVER_ERR)
          
          logger.info("RESULT\n{}\n", result)
          return result
        return helper
      return outer

    def _validate_request(name):
      def outer(func):
        @wraps(func)
        async def helper(self, sid, request):
          try:
            validate(instance=request, schema=breq.schema[name])
            return await func(self, sid, request)
          except ValidationError:
            return make_error(Errors.BAD_REQUEST)
        return helper
      return outer

    @_process_responses("join_board")
    @_validate_request("join_board")
    async def on_join_board(self, sid, request):
      board_id = request["board_id"]
      result = gm.board_manager.join_board(
        board_id=board_id,
      )
      if not is_error(result):
        await self.save_session(sid, {
          "board_id": board_id, 
        })
      return result

    @_process_responses("create_user")
    @_validate_request("create_user")
    async def on_create_user(self, sid, request):
      return gm.board_manager.create_user(
        board_id=request["board_id"],
        nickname=request["nickname"],
      )

    @_process_responses("load_board")
    @_validate_request("load_board")
    async def on_load_board(self, sid, request):
      return gm.board_manager.load_board(
        board_id=request["board_id"],
        user_id=request["user_id"],
      )

    @_process_responses("update_board")
    @_validate_request("update_board")
    async def on_update_board(self, sid, request):
      return gm.board_manager.update_board(
        board_id=request["board_id"],
        user_id=request["user_id"],
      )

    @_process_responses("add_unit")
    @_validate_request("add_unit")
    async def on_add_unit(self, sid, request):
      return gm.board_manager.add_unit(
        board_id=request["board_id"],
        text=request["text"],
      )

    @_process_responses("remove_unit")
    @_validate_request("remove_unit")
    async def on_remove_unit(self, sid, request):
      return gm.board_manager.remove_unit(
        board_id=request["board_id"],
        unit_id=request["unit_id"],
      )

    @_process_responses("edit_unit")
    @_validate_request("edit_unit")
    async def on_edit_unit(self, sid, request):
      return gm.board_manager.edit_unit(
        board_id=request["board_id"],
        unit_id=request["unit_id"],
        text=request["text"],
      )

    @_process_responses("add_link")
    @_validate_request("add_link")
    async def on_add_link(self, sid, request):
      return gm.board_manager.add_link(
        board_id=request["board_id"],
        source=request["source"],
        target=request["target"],
      )

    @_process_responses("remove_link")
    @_validate_request("remove_link")
    async def on_remove_link(self, sid, request):
      return gm.board_manager.remove_link(
        board_id=request["board_id"],
        link_id=request["link_id"],
      )

    @_process_responses("get_unit")
    @_validate_request("get_unit")
    async def on_get_unit(self, sid, request):
      return gm.board_manager.get_unit(
        board_id=request["board_id"],
        unit_id=request["unit_id"],
      )

    @_process_responses("create_disc")
    @_validate_request("create_disc")
    async def on_create_disc(self, sid, request):
      return gm.board_manager.create_disc(
        board_id=request["board_id"],
        unit_id=request["unit_id"],
      )

sio.register_namespace(BoardNamespace('/board'))

class DiscussionNamespace(AsyncNamespace):
    """
    Namespace functions for the discussion abstraction.
    """

    def _process_responses(name, emit=False):
      def outer(func):
        @wraps(func)
        async def helper(self, sid, request):
          try:
            result = None
            logger.info("REQUEST (sid: {})\nfunc_name: {}\nrequest: {}\n".format(
              sid, name, request
            ))
            product = await func(self, sid, request)
            logger.info("func_name: {}\nproduct: {}\nrequest: {}\n".format(
              name, product, request
            ))
            if not is_error(product):
              try:
                validate(instance=product, schema=dres.schema[name])
                result = dumps(product, cls=DictEncoder)
                if emit: # send result to others in room
                  session = await self.get_session(sid)
                  logger.info("Emitting (sid: {}) with {}".format(sid, session))
                  if "board_id" in session and "discussion_id" in session:
                    board_id = session["board_id"]
                    discussion_id = session["discussion_id"]
                    logger.info("Emitting to {}/{}.".format(board_id, discussion_id))
                    await self.emit(
                      name, 
                      result, 
                      room=get_room(board_id, discussion_id), 
                      skip_sid=sid
                    )
              except ValidationError:
                logger.info("Return response: {}\nReturn schema: {}".format(
                  product, name
                ))
                result = make_error(Errors.SERVER_ERR)
            else:
              logger.info("INPUT ERROR\nfunc_name: {}\nReturn response: {}".format(
                name, product
              ))
              result = product
          except Exception as e: # catch generic exceptions
            logger.info("func_name: {}\nrequest: {}\nexception: {}\n".format(
              name, request, e
            ))
            result = make_error(Errors.SERVER_ERR)

          return result
        return helper
      return outer

    def _validate_request(name):
      def outer(func):
        @wraps(func)
        async def helper(self, sid, request):
          try:
            validate(instance=request, schema=dreq.schema[name])
            return await func(self, sid, request)
          except ValidationError:
            return make_error(Errors.BAD_REQUEST)
        return helper
      return outer

    async def on_disconnect(self, sid):
      # leave discussion if we have joined one 
      session = await self.get_session(sid)
      if "board_id" in session and "discussion_id" in session:
        board_id = session["board_id"]
        discussion_id = session["discussion_id"]
        await self.on_leave(sid, {
          "board_id": board_id, 
          "discussion_id": discussion_id
        })

    @_process_responses("join_disc", True)
    @_validate_request("join_disc")
    async def on_join_disc(self, sid, request):
      board_id = request["board_id"]
      discussion_id = request["discussion_id"]
      result = gm.discussion_manager.join_disc(
        board_id=board_id,
        discussion_id=discussion_id,
        user_id=request["user_id"],
      )

      if not is_error(result):
        await self.save_session(sid, {
          "board_id": board_id,
          "discussion_id": discussion_id, 
        })
        self.enter_room(sid, get_room(board_id, discussion_id))

      return result

    @_process_responses("load_disc")
    @_validate_request("load_disc")
    async def on_load_disc(self, sid, request):
      return gm.discussion_manager.load_disc(
        board_id=request["board_id"],
        discussion_id=request["discussion_id"],
      )

    @_process_responses("leave_disc", True)
    @_validate_request("leave_disc")
    async def on_leave_disc(self, sid, request):
      board_id = request["board_id"]
      discussion_id = request["discussion_id"]
      result = gm.discussion_manager.leave_disc(
        board_id=board_id,
        discussion_id=discussion_id,
        user_id=request["user_id"],
      )

      if not is_error(result):
        # may still be in same board
        await self.save_session(sid, {
          "discussion_id": None, 
        })
        self.leave_room(sid, get_room(board_id, discussion_id))

      return result

    @_process_responses("post", True)
    @_validate_request("post")
    async def on_post(self, sid, request):
      return gm.discussion_manager.post(
        board_id=request["board_id"],
        discussion_id=request["discussion_id"],
        user_id=request["user_id"],
        text=request["text"],
      )

    @_process_responses("add_pinned", True)
    @_validate_request("add_pinned")
    async def on_add_pinned(self, sid, request):
      return gm.discussion_manager.add_pinned(
        board_id=request["board_id"],
        discussion_id=request["discussion_id"],
        unit_id=request["unit_id"],
      )

    @_process_responses("remove_pinned", True)
    @_validate_request("remove_pinned")
    async def on_remove_pinned(self, sid, request):
      return gm.discussion_manager.remove_pinned(
        board_id=request["board_id"],
        discussion_id=request["discussion_id"],
        unit_id=request["unit_id"],
      )

    @_process_responses("add_focused", True)
    @_validate_request("add_focused")
    async def on_add_focused(self, sid, request):
      return gm.discussion_manager.add_focused(
        board_id=request["board_id"],
        discussion_id=request["discussion_id"],
        unit_id=request["unit_id"],
      )

    @_process_responses("remove_focused", True)
    @_validate_request("remove_focused")
    async def on_remove_focused(self, sid, request):
      return gm.discussion_manager.remove_focused(
        board_id=request["board_id"],
        discussion_id=request["discussion_id"],
        unit_id=request["unit_id"],
      )

sio.register_namespace(DiscussionNamespace('/discussion'))

def main():
    gm.start()
    aio_app = gm.aio_app
    web.run_app(aio_app, port=constants.PORT)
 
if __name__ == '__main__':
    main()
