import datetime
from typing import (
  Any,
  Dict,
  List,
  Tuple,
)

import constants
import error
from search.basic_search import basic_search
from search.tag_search import tag_search
from utils import utils

from models.discussion import (
  Block,
  Discussion,
  Post,
  Tag,
)


class DiscussionManager:

    def __init__(self, gm):
        self.gm = gm

    """
    Of discussions.
    """

    def get(self, discussion_id: str):
        return Discussion.objects(id=discussion_id)

    def remove(self, discussion_id: str) -> None:
        self.get(discussion_id).delete()

    def get_all(self):
        return [d.id for d in Discussion.objects()]

    #async def create(
    def create(
        self,
        title: str = None,
        theme: str = None,
        time_limit: int = None,
        block_char_limit: int = None,
        summary_char_limit: int = None
    ) -> str:
        discussion_obj = Discussion(
          title=title,
          theme=theme,
          time_limit=time_limit,
          block_char_limit=block_char_limit,
          summary_char_limit=summary_char_limit
        )
        discussion_obj.summary_char_left = summary_char_limit # dependency
        discussion_id = discussion_obj.id

       # add the expire event
#         if time_limit is not None:
#             redis_queue = await constants.redis_pool()
#             await redis_queue.enqueue_job("expire_discussion", discussion_id, _defer_by=datetime.timedelta(seconds=time_limit))

        discussion_obj.save()
        return discussion_id

    """
    Within a discussion.
    First arg is always `discussion_id`.
    """

    def _is_user(self, discussion_id: str, user_id: str) -> bool:
        try:
          user = self.gm.user_manager.get(user_id)
          user.get().discussions.filter(discussion_id=discussion_id).get()
          return True
        except Exception:
          return False

    def _name_exists(self, discussion_id: str, name: str) -> bool:
        discussion_obj = self.get(discussion_id)
        return name in [u.discussions.filter(discussion_id=discussion_id).get().name for u in discussion_obj.get().users]

    def join(self, discussion_id: str, user_id: str, name: str) -> Dict[str, Any]:
        user = self.gm.user_manager.get(user_id).get()
        if not self._is_user(discussion_id, user_id):
            if self._name_exists(discussion_id, name):
                return None
            self.get(discussion_id).update(push__users=user.to_dbref())
            self.gm.user_manager.join_discussion(user_id, discussion_id, name)
        else:
            used_name = self.get_user_name(discussion_id, user_id)
            self.gm.user_manager.join_discussion(user_id, discussion_id, name)
        discussion_obj = self.get(discussion_id).get()
        return {
            "discussion_id": discussion_id,
            "title": discussion_obj.title,
            "theme": discussion_obj.theme,
            "num_users": self.get_num_users(discussion_id),
        }

    def leave(self, discussion_id: str, user_id: str) -> Dict[str, Any]:
        self.gm.user_manager.leave_discussion(user_id, discussion_id)
        return {
            "discussion_id": discussion_id,
            "num_users": self.get_num_users(discussion_id),
        }

    def get_num_users(self, discussion_id: str) -> int:  # only active users
        discussion_obj = self.get(discussion_id)
        num_users = sum([u.discussions.filter(discussion_id=discussion_id).get().active for u in discussion_obj.get().users])
        return num_users

    def get_users(self, discussion_id: str) -> List[str]:
        discussion_obj = self.get(discussion_id)
        user_ids = [u.ip for u in discussion_obj.get().users]
        return user_ids

    def get_names(self, discussion_id: str) -> List[str]:
        discussion_obj = self.get(discussion_id)
        names = list([u.discussions.filter(discussion_id=discussion_id).get().name for u in discussion_obj.get().users])
        return names

    def get_user_name(self, discussion_id: str, user_id: str) -> str:
        user_obj = self.gm.user_manager.get(user_id)
        name = user_obj.get().discussions.filter(discussion_id=discussion_id).get().name
        return name

    def create_post(self, discussion_id: str, user_id: str, blocks: List[str]) -> Dict[str, Any]:
        discussion_obj = self.get(discussion_id)
        post_obj = Post(user=user_id)
        post_id = post_obj.id

        block_ids = []
        for b in blocks:
            block_obj = Block(body=b, user=user_id, post=post_id)
            block_obj.freq_dict = utils.make_freq_dict(b)
            block_ids.append(block_obj.id)
            discussion_obj.update(push__history_blocks=block_obj)
        post_obj.blocks = block_ids
        discussion_obj.update(push__history=post_obj)

        post_info = {
            "post_id": post_obj.id,
            "blocks": post_obj.blocks,
            "created_at": post_obj.created_at,
            "author_name": self.get_user_name(discussion_id, user_id)
        }
        return post_info

    # TODO
    def get_post(self, discussion_id: str, post_id: str):
        discussion_obj = self.get(discussion_id)
        post_obj = discussion_obj.get().history.filter(id=post_id).get()
        return post_obj

    # TODO
    def get_posts(self, discussion_id: str):
        discussion_obj = self.get(discussion_id)
        return [p for p in discussion_obj.get().history]

    def _get_post_ids(self, discussion_id: str) -> List[str]:
        discussion_obj = self.get(discussion_id)
        return [p.id for p in discussion_obj.get().history]

    def get_posts_flattened(self, discussion_id: str) -> Dict[str, Any]:
        discussion_obj = self.get(discussion_id)
        posts_info = [{
            "post_id": p.id,
            "author": p.user,
            "author_name": self.get_user_name(discussion_id, p.user),
            "created_at": p.created_at,
            "blocks": [b for b in p.blocks],
        } for p in discussion_obj.get().history]
        return posts_info

    # TODO
    def get_block(self, discussion_id: str, block_id: str):
        discussion_obj = self.get(discussion_id)
        block_obj = discussion_obj.get().history_blocks.filter(id=block_id)
        return block_obj

    # TODO
    def get_blocks(self, discussion_id: str):
        discussion_obj = self.get(discussion_id)
        return [b for b in discussion_obj.get().history_blocks]

    def _get_block_ids(self, discussion_id: str) -> List[str]:
        discussion_obj = self.get(discussion_id)
        return [b.id for b in discussion_obj.get().history_blocks]

    def get_block_flattened(self, discussion_id: str, block_id: str) -> Dict[str, Any]:
        block_obj = self.get_block(discussion_id, block_id).get()
        if block_obj is not None:
            block_info = {
                "block_id": block_obj.id,
                "body": block_obj.body,
                "tags": block_obj.tags,
            }
        else:
            block_info = None
        return block_info

    def _is_tag_owner_block(self, discussion_id: str, user_id: str, block_id: str, tag: str) -> str:
        block_obj = self.get_block(discussion_id, block_id)
        return block_obj.get().tags.filter(tag=tag).get().owner

    def _is_tag_block(self, discussion_id: str, block_id: str, tag: str) -> bool:
        """
        Only use this once the tag has been created for the discussion.
        """
        block_obj = self.get_block(discussion_id, block_id)
        try:
          block_obj.get().tags.filter(tag=tag).get()
          return True
        except Exception:
          return False

    def block_add_tag(self, discussion_id: str, user_id: str, block_id: str, tag: str) -> None:
        discussion_obj = self.get(discussion_id)
        if not self._is_tag_block(discussion_id, block_id, tag):
            discussion_obj.filter(history_blocks__id=block_id).update(push__history_blocks__S__tags=Tag(tag=tag, owner=user_id))   

    def block_remove_tag(self, discussion_id: str, user_id: str, block_id: str, tag: str) -> None:
        discussion_obj = self.get(discussion_id)
        if self._is_tag_block(discussion_id, block_id, tag):
            if self._is_tag_owner_block(discussion_id, user_id, block_id, tag):
              discussion_obj.filter(history_blocks__id=block_id).update(pull__history_blocks__S__tags__tag=tag)

    def discussion_scope_search(self, discussion_id: str, query: str) -> List[str]:
        discussion_obj = self.get(discussion_id)
        return basic_search(query, discussion_obj.get().history_blocks)

    def discussion_tag_search(self, discussion_id: str, tags: List[str]) -> List[str]:
        discussion_obj = self.get(discussion_id)
        return tag_search(tags, discussion_obj.get().history_blocks)

    # TODO
    def get_user_saved_blocks(self, discussion_id: str, user_id: str):
        block_ids = self.gm.user_manager.get_user_saved_block_ids(user_id, discussion_id)
        blocks = [self.get_block(discussion_id, b).get() for b in block_ids]
        return blocks

    def user_saved_scope_search(self, discussion_id: str, user_id: str, query: str) -> List[str]:
        blocks = self.get_user_saved_blocks(discussion_id, user_id)
        return basic_search(query, blocks)

    def user_saved_tag_search(self, discussion_id: str, user_id: str, tags: List[str]) -> List[str]:
        blocks = self.get_user_saved_blocks(discussion_id, user_id)
        return tag_search(tags, blocks)

    def _transclusion_get_body(self, text: str) -> str:
        match_res = constants.transclusion_header.match(text)
        if match_res:
            return text[len(match_res[0]):]
        else:
            return text

    def _transclusion_get_id(self, text: str) -> str:
        match_res = constants.transclusion_header.match(text)
        if match_res:
            return match_res[0][11:-1]  # get stuff between "transclude<" and ">"
        else:
            return None

    def _get_block_limit(self, discussion_id: str) -> int:
        discussion_obj = self.get(discussion_id)
        try:
          return discussion_obj.get().block_char_limit
        except Exception:
          return None

    def _get_summary_char_left(self, discussion_id: str) -> int:
        discussion_obj = self.get(discussion_id)
        try:
          return discussion_obj.get().summary_char_left
        except Exception:
          return None

    def _set_summary_char_left(self, discussion_id: str, new_limit: int) -> None:
        self.get(discussion_id).update(summary_char_left=new_limit)

    # TODO
    def summary_get_block(self, discussion_id: str, block_id: str):
        discussion_obj = self.get(discussion_id)
        return discussion_obj.get().summary_blocks.filter(id=block_id)

    def summary_add_block(self, discussion_id: str, body: str) -> Tuple[str, str]:
        raw_body = self._transclusion_get_body(body)
        body_len = len(raw_body)
        block_limit_len = self._get_block_limit(discussion_id)
        if block_limit_len:
            if body_len > block_limit_len:
                return None, error.D_S_B_C_BC

        summ_char_left = self._get_summary_char_left(discussion_id)
        if summ_char_left:
            if body_len > summ_char_left:
                return None, error.D_S_B_C_SC
            else:
                summ_char_left = summ_char_left - body_len
                self._set_summary_char_left(discussion_id, summ_char_left)

        block_obj = Block(body=body)
        self.get(discussion_id).update(push__history_blocks=block_obj)
        self.get(discussion_id).update(push__summary_blocks=block_obj)
        block_id = block_obj.id
        return block_id, None

    def summary_modify_block(self, discussion_id: str, block_id: str, body: str) -> Tuple[str, str]:
        # should not be getting transclusions when modifying
        block_obj = self.summary_get_block(discussion_id, block_id).get()
        original_body = block_obj.body
        body_len = len(body)
        block_limit_len = self._get_block_limit(discussion_id)
        if block_limit_len:
            if body_len > block_limit_len:
                return error.D_S_B_C_BC

        summ_char_left = self._get_summary_char_left(discussion_id)
        if summ_char_left:
            new_left = summ_char_left + len(original_body) - body_len
            if new_left < 0:
                return error.D_S_B_C_SC
            else:
                self._set_summary_char_left(discussion_id, new_left)

        self.get(discussion_id).filter(summary_blocks__id=block_id).update(set__summary_blocks__S__body=body)
        return None

    def summary_remove_block(self, discussion_id: str, block_id: str) -> None:
        discussion_obj = self.get(discussion_id)
        discussion_obj.update(pull__summary_blocks__id=block_id)
