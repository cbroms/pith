# TODO: emits have standard output patterns, need to change
# how they are documented

from aiohttp import web
from json import dumps
from jsonschema import validate
import logging
from socketio import AsyncNamespace

import constants
from managers.global_manager import GlobalManager
import schema.discussion_requests as dreq
import schema.board_requests as breq
from utils.utils import GenericEncoder


gm = GlobalManager()
sio = gm.sio


@sio.on('create')
async def create(sid, json):
    """
    :return: **discussion_id**
    :rtype: str
    """
    if validate(instance=json, schema=breq.create):
      #TODO
      return False
    discussion_id = await gm.discussion_manager.create()
    serialized = dumps({"discussion_id": discussion_id}, cls=GenericEncoder)
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

    async def create_user(self, sid, json):
        """
        :param discussion_id: 
        :type discussion_id: str
        :param nickname: 
        :type nickname: str

        :return: **user_id** -
        :rtype: str
        """
        if validate(instance=json, schema=breq.create_user):
          #TODO
          return False
        discussion_id = json["discussion_id"]
        nickname = json["nickname"]

        user_id = gm.discussion_manager.create_user(nickname)
        serialized = dumps({"user_id": user_id}, cls=GenericEncoder)
        return serialized

    async def on_join(self, sid, json):
        """
        :param discussion_id:
        :type discussion_id: str
        :param user_id:
        :type user_id: str

        :returns:
          - **nickname** (*str*)
        :emit: joined_user
        """
        if validate(instance=json, schema=dreq.join):
          #TODO
          return False
        discussion_id = json["discussion_id"]
        user_id = json["user_id"]

        nickname = gm.discussion_manager.join(discussion_id, user_id)
        serialized = dumps({"nickname": nickname}, cls=GenericEncoder)
        self.enter_room(sid, discussion_id)
        await self.emit("joined_user", serialized, room=discussion_id)
        await self.save_session(sid, {
          "discussion_id": discussion_id, 
          "user_id": user_id}
        )

        return serialized

    async def on_leave(self, sid, json):
        """
        :return: **nickname**
        :rtype: str
        :emit: left_user
        """
        session = await self.get_session(sid)
        user_id = session["user_id"]
        discussion_id = session["discussion_id"]
        nickname = gm.discussion_manager.leave(discussion_id, user_id)
        serialized = dumps({"nickname": nickname}, cls=GenericEncoder)
        await self.emit("left_user", serialized, room=discussion_id)
        self.leave_room(sid, discussion_id)

        return serialized

    async def load(self, sid, json):
        """
        :return:
            - **cursors** (*Dict[string,Cursor]*) - Map of active user IDs to cursor positions. 
            - **current_unit** (*str*) - ID of the unit the user was last looking at.
            - **timeline** (*List[TimeInterval]*) - List of the units visited via the cursor.
            - **chat_history** - List of the posts:

              - **created_at** (*datetime*) - Creation time of unit. 
              - **author** (*string*) - Nickname of the author.
              - **units** (*List[string]*) - List of unit IDs.
        """
        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.load(discussion_id, user_id)
        serialized = dumps(info, cls=GenericEncoder)
        return serialized
    
    async def get_unit_page(self, sid, json):
        """
        :param unit_id:
        :type unit_id: str

        :return: 
          - **pith** (*str*) - Pith of the unit.
          - **ancestors** (*List[str]*) - Ancestors of the unit, including self.
          - **children** (*List[(str, List[str])]*) - List of tuples, where each tuple has a children unit ID and the list of children for that unit.
          - **backlinks** (*List[(str, List[str])]*) - List of tuples, where each tuple has a backlink unit ID and the list of backlinks for that unit.
        """
        if validate(instance=json, schema=dreq.get_unit_page):
          #TODO
          return False
        unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        info = gm.discussion_manager.get_unit_page(discussion_id, unit_id)
        serialized = dumps(info, cls=GenericEncoder)
        return serialized

    async def get_unit_content(self, sid, json):
        """
        :param unit_id:
        :type unit_id: str

        :return: 
          - **pith** (*str*) - Pith of the unit.
          - **hidden** (*bool*) - Whether the unit is hidden, default false. 
        """
        if validate(instance=json, schema=dreq.get_unit_content):
          #TODO
          return False
        unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        info = gm.discussion_manager.get_unit_content(discussion_id, unit_id)
        serialized = dumps(info, cls=GenericEncoder)
        return serialized

    async def get_unit_context(self, sid, json):
        """
        :param unit_id:
        :type unit_id: str

        :return: 
          - **pith** (*str*) - Pith of the unit.
          - **children** (*List[str]*) - List of children unit IDs. 
        """
        if validate(instance=json, schema=dreq.get_unit_context):
          #TODO
          return False
        unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        info = gm.discussion_manager.get_unit_context(discussion_id, unit_id)
        serialized = dumps(info, cls=GenericEncoder)
        return serialized

    async def post(self, sid, json):
        """
        :param piths: List of pith strings, one per unit.
        :type piths: List[str]

        :returns:
          - **created_at** (*datetime*) - Creation time of unit. 
          - **author** (*str*) - Nickname of the author. 
          - **piths** (*List[str]*) - List of pith strings, one per unit.
        :emit: created_post
        """
        if validate(instance=json, schema=dreq.post):
          #TODO
          return False
        piths = json["piths"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.post(discussion_id, user_id, piths)
        serialized = dumps(info, cls=GenericEncoder)
        await self.emit("created_post", serialized, room=discussion_id)
        return serialized

    async def on_search(self, sid, json):
        """
        :param query: 
        :type query: str

        :return: **units** - List of unit IDs, sorted in order of relevance.
        :rtype: List[str]
        """
        if validate(instance=json, schema=dreq.search):
          #TODO
          return False
        query = json["query"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        result = gm.discussion_manager.search(discussion_id, query)
        serialized = dumps(result, cls=GenericEncoder)
        return serialized

    async def send_to_doc(self, sid, json):
        """
        :param unit_id: Unit that will be copied to doc.
        :type unit_id: str 

        :return:
          - **unit_id** (*str*) - Unit ID.
          - **pith** (*str*) - Pith of the unit.
          - **created_at** (*datetime*) - Creation time of unit. 
          - **parent** (*str*) - Parent unit ID unit was added to.
          - **position** (*int*) - Index of unit in parent.
        :emit: added_unit
        """
        if validate(instance=json, schema=dreq.send_to_doc):
          #TODO
          return False
        unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.send_to_doc(discussion_id, user_id, unit_id)
        serialized = dumps(result, cls=GenericEncoder)
        await self.emit("added_unit", serialized, room=discussion_id)
        return serialized

    async def move_cursor(self, sid, json): 
        """
        :param position: Position cursor is moved to.
        :type position: Cursor

        :return:
          - **user_id** (*str*) - 
          - **position** (*Cursor*) -
        :emit: moved_cursor
        """
        if validate(instance=json, schema=dreq.move_cursor):
          #TODO
          return False
        position = json["position"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.move_cursor(discussion_id, user_id, position)
        serialized = dumps(result, cls=GenericEncoder)
        await self.emit("moved_cursor", serialized, room=discussion_id)
        return serialized

    async def hide_unit(self, sid, json): 
        """
        :param unit_id:
        :type unit_id: str

        :return: **unit_id**
        :rtype: str
        :emit: hid_unit
        """
        if validate(instance=json, schema=dreq.hide_unit):
          #TODO
          return False
        unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        # TODO save hidden state
        gm.discussion_manager.hide_unit(discussion_id, unit_id)
        serialized = dumps({"unit_id": unit_id}, cls=GenericEncoder)
        await self.emit("hid_unit", serialized, room=discussion_id)
        return serialized

    async def unhide_unit(self, sid, json): 
        """
        :param unit_id:
        :type unit_id: str

        :return: **unit_id**
        :rtype: str
        :emit: unhid_unit
        """
        if validate(instance=json, schema=dreq.unhide_unit):
          #TODO
          return False
        unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        # TODO save hidden state
        gm.discussion_manager.hide_unit(discussion_id, unit_id)
        serialized = dumps({"unit_id": unit_id}, cls=GenericEncoder)
        await self.emit("unhid_unit", serialized, room=discussion_id)
        return serialized

    async def add_unit(self, sid, json): 
        """
        :param pith:
        :type pith: str

        :return: 
          - **unit_id** (*str*) - Unit ID.
          - **pith** (*str*) - Pith of the unit.
          - **created_at** (*datetime*) - Creation time of unit. 
          - **parent** (*str*) - Parent unit ID unit was added to.
          - **position** (*int*) - Index of unit in parent.
        :emit: added_unit
        """
        if validate(instance=json, schema=dreq.add_unit):
          #TODO
          return False
         pith = json["pith"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.added_unit(discussion_id, user_id, pith)
        serialized = dumps(info, cls=GenericEncoder)
        await self.emit("added_unit", serialized, room=discussion_id)
        return serialized

    async def select_unit(self, sid, json): 
        """
        :param unit_id:
        :type unit_id: str

        :return: 
          - **unit_id** (*str*) - Unit ID.
          - **nickname** (*str*) - Nickname of user with unit's position lock.
        :emit: locked_unit_position
        """
        if validate(instance=json, schema=dreq.add_unit):
          #TODO
          return False
         unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.added_unit(discussion_id, user_id, unit_id)
        serialized = dumps(info, cls=GenericEncoder)
        await self.emit("locked_unit_position", serialized, room=discussion_id)
        return serialized

    async def move_units(self, sid, json): 
        """
        :param units: Units to be moved.
        :type units: List[str]
        :param parent: Unit ID of parent unit.
        :type parent: str

        :return: 
          - **unit_id** (*str*) - Unit ID.
          - **parent** (*str*) - Parent unit ID.
          - **position** (*int*) - Position of unit in parent unit.
          - **old_parent** (*str*) - Old parent unit ID.
          - **old_position** (*int*) - Position of unit in old parent unit.
        :emit: repositioned_unit (per unit) OR nothing 
        """
        if validate(instance=json, schema=dreq.move_units):
          #TODO
          return False
        units = json["units"]
        parent = json["parent"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.move_units(discussion_id, user_id, units, parent)
        # TODO: by unit
        serialized = dumps(info, cls=GenericEncoder)
        await self.emit(repositioned_unit, serialized, room=discussion_id)
        return serialized

    async def merge_units(self, sid, json): 
        """
        :param units: Units to be merged.
        :type units: List[str]
        :param parent: Unit ID of parent unit.
        :type parent: str

        :return: 
          - **unit_id** (*str*) - Unit ID.
          - **parent** (*str*) - Parent unit ID.
          - **position** (*int*) - Position of unit in parent unit.
          - **old_parent** (*str*) - Old parent unit ID.
          - **old_position** (*int*) - Position of unit in old parent unit.
        :emit: repositioned_unit (per unit) AND added_unit (for parent unit) OR nothing 
        """
        if validate(instance=json, schema=dreq.merge_units):
          #TODO
          return False
        units = json["units"]
        parent = json["parent"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.merge_units(discussion_id, user_id, units, parent)
        # TODO: by unit
        serialized = dumps(info, cls=GenericEncoder)
        await self.emit(repositioned_unit, serialized, room=discussion_id)
        return serialized

    async def request_to_edit(self, sid, json):
        """
        :param unit_id: 
        :type unit_id: str 

        :return: 
          - **unit_id** (*str*) - Unit ID.
          - **nickname** (*str*) - Nickname of user holding the edit lock.
        :emit: locked_unit_editable
        """
        if validate(instance=json, schema=dreq.request_to_edit):
          #TODO
          return False
        unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        user_id = session["user_id"]
        info = gm.discussion_manager.request_to_edit(discussion_id, user_id, unit_id)
        serialized = dumps(info, cls=GenericEncoder)
        await self.emit(locked_unit_editable, serialized, room=discussion_id)
        return serialized

    async def edit_unit(self, sid, json):
        """
        :param unit_id: 
        :type unit_id: str 
        :param pith: 
        :type pith: str 

        :return: 
          - **unit_id** (*str*) - Unit ID.
          - **pith** (*str*) - Pith of the unit.
        :emit: edited_unit AND removed_back_link (OPT) AND added_backlink (OPT) 
        """
        if validate(instance=json, schema=dreq.edit_unit):
          #TODO
          return False
        unit_id = json["unit_id"]
        pith = json["pith"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        info = gm.discussion_manager.edit_unit(discussion_id, unit_id, pith)
        serialized = dumps(info, cls=GenericEncoder)
        await self.emit(edited_unit, serialized, room=discussion_id)
        return serialized

    async def get_ancestors(self, sid, json):
        """
        :param unit_id: 
        :type unit_id: str 

        :return: ancestors - List of ancestor unit IDs, from most recent to oldest.
        :rtype: List[string]
        """
        if validate(instance=json, schema=dreq.get_ancestors):
          #TODO
          return False
        unit_id = json["unit_id"]

        session = await self.get_session(sid)
        discussion_id = session["discussion_id"]
        info = gm.discussion_manager.get_ancestors(discussion_id, unit_id)
        serialized = dumps(info, cls=GenericEncoder)
        await self.emit(edited_unit, serialized, room=discussion_id)
        return serialized

# TODO: later people can add backlinks directly.

sio.register_namespace(DiscussionNamespace('/discussion'))

def main():
    gm.start()
    logging.basicConfig(level=logging.DEBUG)
    aio_app = gm.aio_app
    web.run_app(aio_app, port=constants.PORT)
 
if __name__ == '__main__':
    main()
