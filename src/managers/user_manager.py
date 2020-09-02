"""
API relating to the user.
"""
from typing import (
  List,
)

from models.user import User


class UserManager:

    def __init__(self, gm):
        self.gm = gm

    """
    Of users.
    """

    # TODO
    def get(self, user_id: str):
        return User.objects(ip=user_id)

    def _is_user(self, user_id: str) -> bool:
        try:
          self.get(user_id).get()
          return True
        except Exception:
          return False

    def create(self, ip: str) -> None:
        if not self._is_user(ip):
            user_obj = User(ip=ip)
            user_obj.save()

    """
    Within a user.
    First arg is always `user_id`.
    """

    def _is_discussion_user(self, user_id: str, discussion_id: str) -> bool:
        user_obj = self.get(user_id)
        try:
          user_obj.get().discussions.filter(discussion_id=discussion_id).get()
          return True
        except Exception:
          return False

    def _is_active_discussion(self, user_id: str, discussion_id: str) -> bool:
        """
        A discussion is not active if it is
        1) not made,
        2) not active.
        """
        if not self._is_discussion_user(user_id, discussion_id): return False
        user_obj = self.get(user_id)
        return user_obj.get().discussions.filter(discussion_id=discussion_id).get().active

    def join_discussion(self, user_id: str, discussion_id: str, name: str) -> None:
        """
        Discussion should check we are not in, or active.
        """
        user_obj = self.get(user_id)
        if self._is_discussion_user(user_id, discussion_id): # rejoin
            user_obj.filter(discussions__discussion_id=discussion_id).update(set__discussions__S__active=True)
        else:
            u = user_obj.get()
            u.discussions.create(
              discussion_id=discussion_id,
              name=name,
              active=True,
            )
            u.save()

    def leave_discussion(self, user_id: str, discussion_id: str) -> None:
        assert(self._is_active_discussion(user_id, discussion_id))
        user_obj = self.get(user_id)
        user_obj.filter(discussions__discussion_id=discussion_id).update(set__discussions__S__active=False)

    def _is_saved_post(self, user_id: str, discussion_id: str, post_id: str) -> bool:
        user_obj = self.get(user_id)
        return post_id in user_obj.get().discussions.filter(discussion_id=discussion_id).get().library_posts

    def save_post(self, user_id: str, discussion_id: str, post_id: str) -> None:
        user_obj = self.get(user_id)
        if not self._is_saved_post(user_id, discussion_id, post_id):
            user_obj.filter(discussions__discussion_id=discussion_id).update(add_to_set__discussions__S__library_posts=post_id)

    def unsave_post(self, user_id: str, discussion_id: str, post_id: str) -> None:
        user_obj = self.get(user_id)
        if self._is_saved_post(user_id, discussion_id, post_id):
            user_obj.filter(discussions__discussion_id=discussion_id).update(pull__discussions__S__library_posts=post_id)

    # TODO
    def get_user_saved_post_ids(self, user_id: str, discussion_id: str):
        user_obj = self.get(user_id)
        return user_obj.get().discussions.filter(discussion_id=discussion_id).get().library_posts

    def _is_saved_block(self, user_id: str, discussion_id: str, block_id: str) -> bool:
        user_obj = self.get(user_id)
        return block_id in user_obj.get().discussions.filter(discussion_id=discussion_id).get().library_blocks

    def save_block(self, user_id: str, discussion_id: str, block_id: str) -> None:
        user_obj = self.get(user_id)
        if not self._is_saved_block(user_id, discussion_id, block_id):
            user_obj.filter(discussions__discussion_id=discussion_id).update(add_to_set__discussions__S__library_blocks=[block_id])

    def unsave_block(self, user_id: str, discussion_id: str, block_id: str) -> None:
        user_obj = self.get(user_id)
        if self._is_saved_block(user_id, discussion_id, block_id):
            user_obj.filter(discussions__discussion_id=discussion_id).update(pull__discussions__S__library_blocks=block_id)

    def get_user_saved_block_ids(self, user_id: str, discussion_id: str) -> List[str]:
        user_obj = self.get(user_id)
        return user_obj.get().discussions.filter(discussion_id=discussion_id).get().library_blocks
