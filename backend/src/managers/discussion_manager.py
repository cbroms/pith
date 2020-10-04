"""
Here, we put unit functions in the discussion namespace.
Many of the unit functions have no need of the discussion information.
"""

import datetime
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
import error
from utils import utils

from models.discussion import (
  Cursor,
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
    def _get(discussion_id):
        return Discussion.objects(id=discussion_id)

    # pointer
    def _get_unit(unit_id):
        return Unit.objects(id=unit_id)

    def _get_ancestors(unit_id):
      curr = unit_id
      while curr != "": 
        ancestors.append(curr)
        unit = self._get_unit(curr).get()    
        curr = unit.parent
      return ancestors

    """
    Verification functions. Require specific arguments in most cases.
    """

    def _check_discussion_id(func):
      """
      Check discussion_id is valid.
      """
      def helper(**kwargs):
        discussion_id = kwargs["discussion_id"]
        try:
          Discussion.objects.get(id=discussion_id)
          return func(**kwargs)
        except DoesNotExist:
          return error.BAD_DISCUSSION_ID 
      return helper
          
    def _check_user_id(func):
      """
      Check user_id is valid.
      NOTE: Requires _check_discussion_id.
      """
      def helper(**kwargs):
        discussion_id = kwargs["discussion_id"]
        user_id = kwargs["user_id"]
        discussion = _get(discussion_id).get()
        if len(discussion.filter(users__id=user_id)) == 0:
          return error.BAD_USER_ID
        else:
          return func(**kwargs)
      return helper

    def _check_unit(key):
      """
      Check unit_id is valid.
      """
      def func_helper(func):
        def helper(**kwargs):
          unit_id = kwargs[key]
          try:
            Unit.objects.get(id=unit_id)
            return func(**kwargs)
          except DoesNotExist:
            return error.BAD_UNIT_ID
        return helper 
      return func_helper

    def _check_units(key):
      """
      Check units are valid.
      """
      def func_helper(func):
        def helper(**kwargs):
          units = kwargs[key]
          try:
            for unit_id in units:
              Unit.objects.get(id=unit_id)
            return func(**kwargs)
          except DoesNotExist:
            return error.BAD_UNIT_ID
        return helper 
      return func_helper

    def _verify_position(func):
      """
      Check position is valid for unit.
      NOTE: Requires _check_unit.
      """
      def helper(**kwargs):
        unit_id = kwargs["unit_id"] # TODO: maybe change
        position = kwargs["position"]
        unit = _get_unit(unit_id)
        if position > len(unit.children) or position < -1:
          return error.BAD_POSITION 
        else: 
          return func(**kwargs)
      return helper

    def _verify_edit_privilege(func):
      """
      Check user can edit unit.
      NOTE: Requires _check_user_id and _check_unit.
      """
      def helper(**kwargs):
        unit_id = kwargs["unit_id"] # TODO: maybe change
        user_id = kwargs["user_id"]
        if unit_id.edit_privilege != user_id:
          return error.BAD_EDIT_TRY
        else:
          return func(**kwargs)
      return helper

    def _verify_position_privilege(func):
      """
      Check user can change position of unit.
      NOTE: Requires _check_user_id and _check_unit.
      """
      def helper(**kwargs):
        unit_id = kwargs["unit_id"] # TODO: maybe change
        user_id = kwargs["user_id"]
        if unit_id.position_privilege != user_id:
          return error.BAD_POSITION_TRY
        else:
          return func(**kwargs)
      return helper

    def _verify_parent(func):
      """
      Check potential parent can be parent of units.
      If any of the units are the potential parent or ancestors of the parent, the parent is invalid.
      NOTE: Requires _check_unit on parent and _check_units units. 
      """
      def helper(**kwargs):
        parent = kwargs["parent"]
        units = kwargs["units"]
        ancestors = _get_ancestors(parent)
        inter = set(ancestors).intersection(set(units))
        if len(inter) > 0:
          return error.BAD_PARENT
        else:
          return func(**kwargs)
      return helper

    """
    Service functions.
    """

    @_check_discussion_id
    def create_user(self, discussion_id, nickname):
        discussion = self._get(discussion_id)
        unit_id = discussion.get().document
        cursor = Cursor(unit_id, -1) 
        user = User(name=nickname, viewed_unit=unit_id, cursor=cursor) 
        discussion.update(push__users=user)
        response = {"user_id": user.id}
        return response

    @_check_discussion_id
    def join(self, discussion_id, user_id):
        discussion = self._get(discussion_id)
        discussion.filter(users__id=user_id).update(users__S__active=True) 
        nickname = discussion.get().users.filter(id=user_id).name
        response = {"nickname": nickname}
        return nickname

    @_check_discussion_id
    @_check_user_id
    def leave(self, discussion_id, user_id):
        discussion = self._get(discussion_id)
        discussion.filter(users__id=user_id).update(users__S__active=False) 
        nickname = discussion.get().users.filter(id=user_id).name
        response = {"nickname": nickname}
        return nickname

    @_check_discussion_id
    @_check_user_id
    def load(self, discussion_id, user_id):
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_unit["unit_id"]
    def get_unit_page(self, discussion_id, unit_id):
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_unit("unit_id")
    def get_ancestors(self, discussion_id, unit_id):
        return self._get_ancestors(unit_id)

    @_check_discussion_id
    @_check_unit["unit_id"]
    def get_unit_content(self, discussion_id, unit_id):
        discussion = self._get(discussion_id)
  
    @_check_discussion_id
    @_check_unit["unit_id"]
    def get_unit_context(self, discussion_id, unit_id):
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_user_id
    def post(self, discussion_id, user_id, pith):
        discussion = self._get(discussion_id)

    @_check_discussion_id
    def search(self, discussion_id, query):
        discussion = self._get(discussion_id)
        # TODO figure out how to use indexing
      
    @_check_discussion_id
    @_check_user_id
    @_check_unit("unit_id")
    def send_to_doc(self, discussion_id, user_id, unit_id):
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_user_id
    @_check_unit["unit_id"]
    @_verify_position
    def move_cursor(self, discussion_id, user_id, unit_id, position):
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_unit["unit_id"]
    @_verify_edit_privilege
    def hide_unit(self, discussion_id, unit_id):
        """ 
          Assumes we have edit lock through `request_to_edit`.
          Releases edit lock.
        """
        discussion = self._get(discussion_id)
        
    @_check_discussion_id
    @_check_unit["unit_id"]
    def unhide_unit(self, discussion_id, unit_id):
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_user_id
    def added_unit(self, discussion_id, user_id, pith):
        """
          Releases edit lock.
        """
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_user_id
    @_check_unit["unit_id"]
    def select_unit(self, discussion_id, user_id, unit_id):
        """
          Takes position lock.
        """
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_user_id
    @_check_units["units"]
    @_check_unit["parent"]
    @_verify_position_privilege
    @_verify_parent
    def move_units(self, discussion_id, user_id, units, parent):
        """
          Releases position lock.
        """
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_user_id
    @_check_units["units"]
    @_check_unit["parent"]
    @_verify_position_privilege
    @_verify_parent
    def merge_units(self, discussion_id, user_id, units, parent):
        """
          Releases position lock.
        """
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_user_id
    @_check_unit["unit_id"]
    def request_to_edit(self, discussion_id, user_id, unit_id):
        """
          Takes edit lock.
        """
        discussion = self._get(discussion_id)

    @_check_discussion_id
    @_check_unit["unit_id"]
    @_verify_edit_privilege
    def edit_unit(self, discussion_id, unit_id, pith):
        """
          Releases edit lock.
        """
        discussion = self._get(discussion_id)
