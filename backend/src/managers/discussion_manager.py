"""
Here, we put unit functions in the discussion namespace.
Many of the unit functions have no need of the discussion information.
"""

from datetime import datetime
import logging
from mongoengine import DoesNotExist
from typing import (
  Any,
  Dict,
  List,
  Optional,
  Tuple,
)

import constants
from error import Errors
from utils import utils

from models.discussion import (
  Cursor,
  TimeInterval,
  Discussion,
  Unit,
  User,
)


class DiscussionManager:

    def __init__(self, gm):
        self.gm = gm
        self.redis_queue = self.gm.redis_queue

    """
    Unprotected helper functions.
    """

    # pointer
    def _get(self, discussion_id):
        return Discussion.objects(id=discussion_id)

    # pointer
    def _get_unit(self, unit_id):
        return Unit.objects(id=unit_id)

    def _get_ancestors(self, unit_id):
        ancestors = []
        curr = unit_id
        while curr != "": # root 
          ancestors.append(curr)
          unit = self._get_unit(curr).get()
          curr = unit.parent
        return ancestors

    def _time_entry(self, discussion_id, user_id):
        """
        NOTE: Requires viewed_unit to be properly set.
        """
        discussion = self._get(discussion_id)
        user = discussion.get().users.filter(id=user_id).get()
        now = datetime.utcnow() #.strftime(constants.DATE_TIME_FMT)
        time_interval = TimeInterval(
          unit_id=user.viewed_unit,
          start_time=user.start_time,
          end_time=now) 
        discussion.filter(users__id=user_id).update(
          push__users__S__timeline=time_interval,
          set__users__S__start_time=now # update start time for new unit
        )

    def _release_edit(self, unit_id):
        unit = self._get_unit(unit_id)
        unit.update(edit_privilege=None)

    def _release_position(self, unit_id):
        unit = self._get_unit(unit_id)
        unit.update(position_privilege=None)

    def _retrieve_links(self, pith):
      return constants.link_pattern.findall(pith)

    def _get_position(self, parent, unit_id):
      children = self._get_unit(parent).get().children
      if unit_id in children:
        return children.index(unit_id)
      else:
        return -1

    def _chat_meta(self, discussion_id, unit_id):
      unit = self._get_unit(unit_id).get()
      user = self._get(discussion_id).get().users.filter(id=unit.author).get()
      response = {
        "unit_id": unit_id,
        "pith": unit.pith,
        "author": user.name,
        "created_at": unit.created_at.strftime(constants.DATE_TIME_FMT)
      }
      return response

    def _doc_meta(self, discussion_id, unit_id):
      unit = self._get_unit(unit_id).get()
      response = {
        "unit_id": unit_id,
        "pith": unit.pith,
        "hidden": unit.hidden,
        "created_at": unit.created_at.strftime(constants.DATE_TIME_FMT),
        "edit_privilege": unit.edit_privilege,
        "position_privilege": unit.position_privilege,
        "children": list(unit.children),
        "backlinks": list(unit.backlinks),
      }
      return response

    # TODO: MULTIPLE MONGO OPERATIONS
    def _move_units(self, discussion_id, user_id, units, parent_id, position):
        discussion = self._get(discussion_id)
        user = discussion.get().users.filter(id=user_id).get()
        parent = self._get_unit(parent_id)

        doc_meta = []

        # remove from old
        for unit_id in units:
          unit = self._get_unit(unit_id)
          old_parent = unit.get().parent
          self._get_unit(old_parent).update(
            pull__children=unit_id
          )
          # TODO don't need to add unit to doc_meta
          doc_meta.append(old_parent)

        # add to new
        key = "push__children__{}".format(position)
        parent.update(**{key: units})
        for unit_id in units:
          unit = self._get_unit(unit_id)
          unit.update(
            set__parent=parent_id,
          )
          self._release_position(unit_id)
        doc_meta.append(parent)
      
        return doc_meta

    """
    Verification functions. Require specific arguments in most cases.
    args should only contain self. Other arguments should be in kwargs so they are queryable.
    """

    def _check_discussion_id(func):
      """
      Check discussion_id is valid.
      """
      def helper(self, **kwargs):
        discussion_id = kwargs["discussion_id"]
        try:
          self._get(discussion_id).get()
          #Discussion.objects.get(id=discussion_id)
          return func(self, **kwargs)
        except DoesNotExist:
          return utils.make_error(Errors.BAD_DISCUSSION_ID)
      return helper
          
    def _check_user_id(func):
      """
      Check user_id is valid.
      NOTE: Requires _check_discussion_id.
      """
      def helper(self, **kwargs):
        discussion_id = kwargs["discussion_id"]
        user_id = kwargs["user_id"]
        discussion = self._get(discussion_id)
        if len(discussion.filter(users__id=user_id)) == 0:
          return utils.make_error(Errors.BAD_USER_ID)
        else:
          return func(self, **kwargs)
      return helper

    def _check_unit_id(func):
      """
      Check unit_id is valid.
      """
      def helper(self, **kwargs):
        unit_id = kwargs["unit_id"]
        try:
          Unit.objects.get(id=unit_id)
          return func(self, **kwargs)
        except DoesNotExist:
          return utils.make_error(Errors.BAD_UNIT_ID)
      return helper 

    def _check_units(func):
      """
      Check units are valid.
      """
      def helper(self, **kwargs):
        units = kwargs["units"]
        try:
          for unit_id in units:
            Unit.objects.get(id=unit_id)
          return func(self, **kwargs)
        except DoesNotExist:
          return utils.make_error(Errors.BAD_UNIT_ID)
      return helper 

    def _verify_position(func):
      """
      Check position is valid for unit.
      NOTE: Requires _check_unit_id.
      """
      def helper(self, **kwargs):
        unit_id = kwargs["unit_id"]
        position = kwargs["position"]
        unit = self._get_unit(unit_id).get()
        if position > len(unit.children) or position < -1:
          return utils.make_error(Errors.BAD_POSITION)
        else: 
          return func(self, **kwargs)
      return helper

    def _verify_edit_privilege(func):
      """
      Check user can edit unit.
      NOTE: Requires _check_user_id and _check_unit_id.
      """
      def helper(self, **kwargs):
        unit_id = kwargs["unit_id"]
        user_id = kwargs["user_id"]
        unit = self._get_unit(unit_id).get()
        if unit.edit_privilege != user_id:
          return utils.make_error(Errors.BAD_EDIT_TRY)
        else:
          return func(self, **kwargs)
      return helper

    def _verify_positions_privilege(func):
      """
      Check user can change position of unit.
      NOTE: Requires _check_user_id and _check_unit_id.
      """
      def helper(self, **kwargs):
        units = kwargs["units"]
        user_id = kwargs["user_id"]
        for unit_id in units:
          unit = self._get_unit(unit_id).get()
          if unit.position_privilege != user_id:
            return utils.make_error(Errors.BAD_POSITION_TRY)
        return func(self, **kwargs)
      return helper

    def _verify_parent(func):
      """
      Check parent and position are valid.
      If any of the units are the potential parent or ancestors of the parent, the parent is invalid.
      NOTE: Requires _check_user_id _check_units on units. 
      """
      def helper(self, **kwargs):
        discussion_id = kwargs["discussion_id"]
        user_id = kwargs["user_id"]
        units = kwargs["units"]
        parent = kwargs["parent"]
        position = kwargs["position"]
        discussion = self._get(discussion_id)
        user = discussion.get().users.filter(id=user_id).get()

        try:
          Unit.objects.get(id=parent)
        except DoesNotExist:
          return utils.make_error(Errors.BAD_UNIT_ID)

        parent_ptr = self._get_unit(parent)
        if position > len(parent_ptr.get().children) or position < 0: # fixed
          return utils.make_error(Errors.BAD_POSITION)

        ancestors = self._get_ancestors(parent)
        inter = set(ancestors).intersection(set(units))
        if len(inter) > 0:
          return utils.make_error(Errors.BAD_PARENT)
        else:
          return func(self, **kwargs)
      return helper

    """
    Service functions.
    """

    def test_connect(self, discussion_id):
        try:
          self._get(discussion_id).get()
          return None, None
        except DoesNotExist:
          return utils.make_error(Errors.BAD_DISCUSSION_ID)

    @_check_discussion_id
    def create_user(self, discussion_id, nickname, user_id=None):
        discussion = self._get(discussion_id)
        if len(discussion.filter(users__name=nickname)) > 0:
          return utils.make_error(Errors.NICKNAME_EXISTS)
        if user_id is not None:
          if len(discussion.filter(users__id=user_id)) > 0:
            return utils.make_error(Errors.USER_ID_EXISTS)

        unit_id = discussion.get().document
        cursor = Cursor(unit_id=unit_id, position=-1) 
        user = User(
          name=nickname,
          viewed_unit=unit_id,
          start_time=datetime.utcnow(), #.strftime(constants.DATE_TIME_FMT),
          cursor=cursor
        ) 
        if user_id is not None: # use pre-chosen id
          user.id = user_id
        discussion.update(push__users=user)
        response = {"user_id": user.id}
        return response, None

    @_check_discussion_id
    @_check_user_id
    def load_user(self, discussion_id, user_id):
        discussion = self._get(discussion_id).get()
        user = discussion.users.filter(id=user_id).get()

        doc_meta = []
        chat_meta = []

        cursors = []
        for p in discussion.users:
          if p.active:
            cursors.append({
              "user_id": p.id,
              "nickname": p.name, 
              "cursor": p.cursor.to_mongo().to_dict()
            })
          doc_meta.append(self._doc_meta(discussion_id, p.cursor.unit_id))

        timeline = []
        for i in user.timeline: 
          timeline.append({
            "unit_id": i.unit_id,
            "start_time": i.start_time.strftime(constants.DATE_TIME_FMT),
            "end_time": i.end_time.strftime(constants.DATE_TIME_FMT),
          })
          doc_meta.append(self._doc_meta(discussion_id, i.unit_id))

        unit_ids = []
        for u in discussion.chat:
          unit = self._get_unit(u).get()
          unit_ids.append(u)
          unit_ids += unit.forward_links 
        unit_ids = list(set(unit_ids))

        for u in unit_ids: # chat units and forward links
          unit = self._get_unit(u).get()
          chat_meta.append(self._chat_meta(discussion_id, u))

        response = {
          "nickname": user.name,
          "cursors": cursors,
          "current_unit": user.viewed_unit, 
          "timeline": timeline,
          "chat_history": list(discussion.chat), 
          "chat_meta": chat_meta,
          "doc_meta": doc_meta
        }
        return response

    @_check_discussion_id
    def join(self, discussion_id, user_id):
        """
        Update start time of current unit.
        """
        discussion = self._get(discussion_id)
        discussion.filter(users__id=user_id).update(
          set__users__S__active=True,
          set__users__S__start_time=
            datetime.utcnow() #.strftime(constants.DATE_TIME_FMT)
        ) 

        user = discussion.get().users.filter(id=user_id).get()

        response = load_user(discussion_id, user_id)
        cursor_response = {
          "user_id": user_id,
          "nickname": user.name,
          "cursor": user.cursor.to_mongo().to_dict()
        }
        return response, [cursor_response]

    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    @_check_user_id
    def leave(self, discussion_id, user_id):
        """
        Create new time interval for last visited unit.
        """
        discussion = self._get(discussion_id)
        discussion.filter(users__id=user_id).update(set__users__S__active=False) 
        self._time_entry(discussion_id, user_id)

        nickname = discussion.get().users.filter(id=user_id).get().name
        response = {
          "user_id": user_id,
          "nickname": nickname
        }
        return None, [response]

    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    @_check_user_id
    @_check_unit_id
    def load_unit_page(self, discussion_id, user_id, unit_id):
        """
        This is the trigger for updating the timeline.
        """
        discussion = self._get(discussion_id)
        # perform unit-based operations
        unit = self._get_unit(unit_id).get()

        doc_meta = []
        doc_meta.append(self._doc_meta(discussion_id, unit_id))
        for c in unit.children:
          c_unit = self._get_unit(c).get()
          for g in c_unit.children:
            doc_meta.append(self._doc_meta(discussion_id, g))
          doc_meta.append(self._doc_meta(discussion_id, c))
        for b in unit.backward_links:
          b_unit = self._get_unit(b).get()
          for g in b_unit.backward_links:
            doc_meta.append(self._doc_meta(discussion_id, g))
          doc_meta.append(self._doc_meta(discussion_id, b))

        # update cursor
        discussion.filter(users__id=user_id).update(
          set__users__S__cursor__unit_id=unit_id, # new page
          set__users__S__cursor__position=-1 # for now, default to end
        )
        # uses old viewed unit
        self._time_entry(discussion_id, user_id)
        user = discussion.get().users.filter(id=user_id).get()
        nickname = user.name
        cursor = user.cursor
        time_interval = user.timeline[-1] # newly made
        timeline_entry = {
          "unit_id": time_interval.unit_id,
          "start_time": time_interval.start_time.strftime(constants.DATE_TIME_FMT),
          "end_time": time_interval.end_time.strftime(constants.DATE_TIME_FMT),
        }

        # update viewed unit to current
        discussion.filter(users__id=user_id).update(
          set__users__S__viewed_unit = unit_id
        )

        # ancestors
        ancestors = self._get_ancestors(unit_id)
        for a in ancestors:
          doc_meta.append(self._doc_meta(discussion_id, a))

        response = {
          "ancestors": ancestors,
          "timeline_entry": timeline_entry,
          "doc_meta": doc_meta
        }
        cursor_response = {
          "user_id": user_id,
          "nickname": nickname,
          "cursor": cursor.to_mongo().to_dict(),
        }

        return response, [cursor_response]

    @_check_discussion_id
    @_check_unit_id
    def get_ancestors(self, discussion_id, unit_id):
        ancestors = self._get_ancestors(unit_id)

        doc_meta = []
        for a in ancestors:
          doc_meta.append(a)

        response = {
          "ancestors": ancestors,
          "doc_meta": doc_meta
        }
        return response, None

    @_check_discussion_id
    @_check_unit_id
    def get_unit_content(self, discussion_id, unit_id):
        unit = self._get_unit(unit_id).get()
        response = {
          "pith": unit.pith,
          "hidden": unit.hidden
        }
        return response, None
  
    @_check_discussion_id
    @_check_unit_id
    def get_unit_context(self, discussion_id, unit_id):
        response = self._doc_meta(discussion_id, unit_id)
        return response, None

    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    @_check_user_id
    def post(self, discussion_id, user_id, pith):
        discussion = self._get(discussion_id)

        chat_meta = []
        doc_meta = []

        forward_links = self._retrieve_links(pith)
        for f in forward_links:
            unit = self._get_unit(f)
            if unit.get().in_chat:
              chat_meta.append(self._chat_meta(discussion_id, f))
            else:
              doc_meta.append(self._doc_meta(discussion_id, f))

        unit = Unit(
          pith=pith,
          parent="",
          author=user_id,
          in_chat=True,
          forward_links=forward_links,
          original_pith=pith,
        )
        unit_id = unit.id
        unit.save()
        discussion.update(push__chat=unit_id)
        chat_meta.append(self._chat_meta(discussion_id, unit_id))

        # make backlinks
        for f in forward_links:
          self._get_unit(f).update(
            push__backward_links = unit_id
          )
          unit = self._get_unit(f)
          if unit.get().in_chat:
            chat_meta.append(self._chat_meta(discussion_id, f))
          else:
            doc_meta.append(self._doc_meta(discussion_id, f))

        post = {
          "unit_id": unit_id,
        }
        return None, [post, doc_meta, chat_meta]

    @_check_discussion_id
    def search(self, discussion_id, query):
        """
        https://docs.mongodb.com/manual/reference/operator/query/text/
        """
        discussion = self._get(discussion_id)
        results = Unit.objects()._collection.find({"$text": {"$search": query}})

        chat = []
        doc = []

        chat_meta = []
        doc_meta = []

        for unit in results: # dict form
          unit_id = unit["_id"]
          entry = {
            "unit_id": unit_id,
          }
          if unit["in_chat"]:
            chat.append(entry)
            chat_meta.append(self._chat_meta(discussion_id, unit_id))
          else:
            doc.append(entry)
            doc_meta.append(self._doc_meta(discussion_id, unit_id))

        response = {
          "chat_units": chat,
          "doc_units": doc,
          "chat_meta": chat_meta,
          "doc_meta": doc_meta
        }
        return response, None
      
    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    @_check_unit_id
    def send_to_doc(self, discussion_id, user_id, unit_id):
        """
        NOTE: 
        The document unit does not copy over the chat unit's backward links.
        Instead, we have a pointer to the chat unit, so we can use that to find
        "backlinks".
        """
        discussion = self._get(discussion_id)
        user = discussion.get().users.filter(id=user_id).get()
        chat_unit = self._get_unit(unit_id).get()

        position = user.cursor.position if user.cursor.position != -1 else \
          len(self._get_unit(user.cursor.unit_id).get().children)
        forward_links = chat_unit.forward_links
        parent_id = user.cursor.unit_id
        unit = Unit(
          pith=chat_unit.pith,
          forward_links=forward_links,
          parent=parent_id,
          source_unit_id=unit_id, # from chat
          original_pith=chat_unit.pith
        )
        unit.save()
        unit_id = unit.id

        parent = self._get_unit(parent_id)
        key = "push__children__{}".format(position)
        parent.update(**{key: [unit_id]})

        doc_meta = []
        chat_meta = []
        doc_meta.append(self._doc_meta(discussion_id, unit_id))
        doc_meta.append(self._doc_meta(discussion_id, parent))

        for f in forward_links:
          unit = self._get_unit(f)
          if unit.get().in_chat:
            chat_meta.append(self._chat_meta(discussion_id, f))
          else:
            doc_meta.append(self._doc_meta(discussion_id, f))

        for f in forward_links:
          self._get_unit(f).update(
            push__backward_links = unit_id
          )
          doc_meta.append(self._doc_meta(discussion_id, f))
        
        return None, [doc_meta, chat_meta]

    @_check_discussion_id
    @_check_user_id
    @_check_unit_id
    @_verify_position
    def move_cursor(self, discussion_id, user_id, unit_id, position):
        discussion = self._get(discussion_id)
        discussion.filter(users__id=user_id).update(
          set__users__S__cursor__unit_id=unit_id,
          set__users__S__cursor__position=position
        )

        user = discussion.get().users.filter(id=user_id).get()
        response = {
            "user_id": user_id,
            "nickname": user.name,
            "cursor": user.cursor.to_mongo().to_dict()
        }
        return None, [response]

    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    @_check_unit_id
    @_verify_edit_privilege
    def hide_unit(self, discussion_id, user_id, unit_id):
        """ 
          Assumes we have edit lock through `request_to_edit`.
          Releases edit lock.
        """
        unit = self._get_unit(unit_id)
        unit.update(hidden=True)
        
        self._release_edit(unit_id)

        doc_meta = [self._doc_meta(discussion_id, unit_id)]
        return None, [doc_meta]
        
    @_check_discussion_id
    @_check_unit_id
    def unhide_unit(self, discussion_id, unit_id):
        unit = self._get_unit(unit_id)
        unit.update(hidden=False)
        
        doc_meta = [self._doc_meta(discussion_id, unit_id)]
        return None, [doc_meta]

    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    def add_unit(self, discussion_id, pith, parent, position):
        """
          Try to use previous to place new unit, otherwise use position.
          Releases edit lock.
        """
        discussion = self._get(discussion_id)

        forward_links = self._retrieve_links(pith)

        unit = Unit(
          pith=pith,
          forward_links=forward_links,
          parent=parent,
        )
        unit.save()
        unit_id = unit.id

        parent_ptr = self._get_unit(parent)
        key = "push__children__{}".format(position)
        parent_ptr.update(**{key: [unit_id]})

        doc_meta = []
        chat_meta = []
        doc_meta.append(self._doc_meta(discussion_id, unit_id))
        doc_meta.append(self._doc_meta(discussion_id, parent))

        for f in forward_links:
          unit = self._get_unit(f)
          if unit.get().in_chat:
            chat_meta.append(self._chat_meta(discussion_id, f))
          else:
            doc_meta.append(self._doc_meta(discussion_id, f))

        # make backlinks
        for f in forward_links:
          self._get_unit(f).update(
            push__backward_links = unit_id
          )
          unit = self._get_unit(f)
          if unit.get().in_chat:
            chat_meta.append(self._chat_meta(discussion_id, f))
          else:
            doc_meta.append(self._doc_meta(discussion_id, f))

        return None, [doc_meta, chat_meta]

    # TODO: might support multi-select
    @_check_discussion_id
    @_check_user_id
    @_check_unit_id
    def select_unit(self, discussion_id, user_id, unit_id):
        """
          Takes position lock.
        """
        discussion = self._get(discussion_id)
        unit = self._get_unit(unit_id) 
        if unit.get().position_privilege is not None: 
          return utils.make_error(Errors.FAILED_POSITION_ACQUIRE)
        unit.update(position_privilege=user_id)

        doc_meta = [self._doc_meta(discussion_id, unit_id)]
        return None, [doc_meta]

    @_check_discussion_id
    @_check_user_id
    @_check_unit_id
    @_verify_positions_privilege
    def deselect_unit(self, discussion_id, user_id, unit_id):
        self._release_position(unit_id)
        doc_meta = [self._doc_meta(discussion_id, unit_id)]
        return None, [doc_meta]

    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    @_check_user_id
    @_check_units
    @_verify_positions_privilege
    @_verify_parent
    def move_units(self, discussion_id, user_id, units, parent, position):
        """
          Releases position lock.
          Removes each of the units from old parent and puts under new parent.
        """
        discussion = self._get(discussion_id)
        user = discussion.get().users.filter(id=user_id).get()
        doc_meta = self._move_units(discussion_id, user_id, units, parent, position)

        return None, [doc_meta]

    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    @_check_user_id
    @_check_units
    @_verify_positions_privilege
    @_verify_parent
    def merge_units(self, discussion_id, user_id, units, parent, position):
        """
          Releases position lock.
          Removes each of the units from old parent and puts under new parent.
        """
        discussion = self._get(discussion_id)
        user = discussion.get().users.filter(id=user_id).get()
        doc_meta = self.add_unit(
          discussion_id=discussion_id, pith="", 
          parent=parent, position=position
        )[1][0] 
        doc_meta2 = self._move_units(discussion_id, user_id, units, 
          added_unit["unit_id"], 0) # put at head

        doc_meta += doc_meta2

        return None, [doc_meta]

    @_check_discussion_id
    @_check_user_id
    @_check_unit_id
    def request_to_edit(self, discussion_id, user_id, unit_id):
        """
          Takes edit lock.
        """
        discussion = self._get(discussion_id)
        unit = self._get_unit(unit_id) 
        if unit.get().edit_privilege is not None: 
          return utils.make_error(Errors.FAILED_EDIT_ACQUIRE)
        unit.update(edit_privilege=user_id)

        doc_meta = [self._doc_meta(discussion, unit_id)]
        return None, [doc_meta]

    @_check_discussion_id
    @_check_user_id
    @_check_unit_id
    @_verify_edit_privilege
    def deedit_unit(self, discussion_id, user_id, unit_id):
        self._release_edit(unit_id)
        doc_meta = [self._doc_meta(discussion, unit_id)]
        return None, [doc_meta]

    # TODO: MULTIPLE MONGO OPERATIONS
    @_check_discussion_id
    @_check_user_id
    @_check_unit_id
    @_verify_edit_privilege
    def edit_unit(self, discussion_id, user_id, unit_id, pith):
        """
          Releases edit lock.
        """
        unit = self._get_unit(unit_id) 
        old_forward_links = unit.get().forward_links
        forward_links = self._retrieve_links(pith)
        unit.update(
          pith=pith, 
          forward_links=forward_links,
          edit_count=unit.get().edit_count + 1 # increment
        )
        self._release_edit(unit_id)

        # handle backlinks
        removed_links = set(old_forward_links).difference(set(forward_links)) 
        for r in removed_links: # remove backlink 
          unit = self._get_unit(r).update(
            pull__backward_links = unit_id
          )
        added_links = set(forward_links).difference(set(old_forward_links))
        for a in added_links: # add backlink 
          unit = self._get_unit(a).update(
            push__backward_links = unit_id
          )

        doc_meta = []
        chat_meta = []
        doc_meta.append(self._doc_meta(discussion_id, unit_id))

        # backward links added/removed
        for b in removed_links + added_links:
          unit = self._get_unit(b)
          if unit.get().in_chat:
            chat_meta.append(self._chat_meta(discussion_id, b))
          else:
            doc_meta.append(self._doc_meta(discussion_id, b))

        return None, [doc_meta, chat_meta]
