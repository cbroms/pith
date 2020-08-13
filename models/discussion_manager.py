import constants
import datetime
import error

from models.discussion import (
  Block,
  Discussion,
  Post,
)
from models.tag import Tag

from search.basic_search import basic_search
from search.tag_search import tag_search

from utils import utils


class DiscussionManager:

    def __init__(self, gm, sio, db):
        self.sio = sio
        # self.discussions = db["discussions"]
        self.gm = gm

    """
    Of discussions.
    """

    def get(self, discussion_id):
        Discussion.objects(_id=discussion_id).get()

    def remove(self, discussion_id):
        Discussion.objects(_id=discussion_id).delete()

#     def get_all(self):
#         return [d._id for d in Discussion.objects()]

    async def create(
        self,
        title=None,
        theme=None,
        time_limit=None,
        block_char_limit=None,
        summary_char_limit=None
    ):
        discussion_obj = Discussion(
          title=title,
          theme=theme,
          time_limit=time_limit,
          block_char_limit=block_char_limit,
          summary_char_limit=summary_char_limit
        )
        discussion_obj.summary_char_left = summary_char_limit # dependency
        discussion_id = discussion_obj._id

       # add the expire event
        if time_limit is not None:
            redis_queue = await constants.redis_pool()
            await redis_queue.enqueue_job("expire_discussion", discussion_id, _defer_by=datetime.timedelta(seconds=time_limit))
        discussion_obj.save()

        return discussion_id

    """
    Within a discussion.
    First arg is always `discussion_id`.
    """

    # TODO
    def _is_user(self, discussion_id, user_id):
        discussion_obj = self.get(discussion_id)
        return user_id in discussion_obj.users

    # TODO
    def _name_exists(self, discussion_id, name):
        discussion_obj = self.get(discussion_id)
        return name in list(
            [u["name"] for u in discussion_obj.users.values()]
        )

    # TODO
    def join(self, discussion_id, user_id, name):
        is_user = self._is_user(discussion_id, user_id)

        if not is_user:
            if self._name_exists(discussion_id, name):
                return None

            self.gm.user_manager.join_discussion(user_id, discussion_id, name)
            temp = self.get(discussion_id).users
            temp[user_id] = {"name": name, "active": True}
            self.get(discussion_id).update(users=temp)
        else:
            if name == self.get_user_name(discussion_id, user_id):
                self.gm.user_manager.join_discussion(user_id, discussion_id, name)
                temp = self.get(discussion_id).users
                temp[user_id]["active"] = True
                self.get(discussion_id).update(users=temp)
            # in the case that the user enters a new name, just return the discussion
            # info without erroring. This indicates that the user cleared their
            # localstorage on the fontend without reloading the page. This should
            # very rarely happen.
        discussion_obj = self.get(discussion_id)
        return {
            "discussion_id": discussion_id,
            "title": discussion_obj.title,
            "theme": discussion_obj.theme,
            "num_users": self.get_num_users(discussion_id),
        }

    # TODO
    def leave(self, discussion_id, user_id):
        self.gm.user_manager.leave_discussion(user_id, discussion_id)
        if self._is_user(discussion_id, user_id):
            temp = self.get(discussion_id).users
            temp[user_id]["active"] = False
            self.get(discussion_id).update(users=temp)
        return {
            "discussion_id": discussion_id,
            "num_users": self.get_num_users(discussion_id),
        }

    def get_num_users(self, discussion_id):  # only active users
        discussion_obj = self.get(discussion_id)
        num_users = sum([u["active"] for u in discussion_obj.users.values()])
        return num_users

    def get_users(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        user_ids = list(discussion_obj.users.keys())
        return user_ids

    def get_names(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        names = list([u["name"] for u in discussion_obj.users.values()])
        return names

    def get_users(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        user_ids = list([k for k, u in discussion_obj.users.items() if u["active"]])
        return user_ids

    def get_names(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        names = list([u["name"] for u in discussion_obj.users.values() if u["active"]])
        return names

    def get_user_name(self, discussion_id, user_id):
        discussion_obj = self.get(discussion_id)
        name = discussion_obj.users[user_id]["name"]
        return name

    def create_post(self, discussion_id, user_id, blocks):
        post_obj = Post(user=user_id)

        block_refs = []
        #freq_dicts = []
        for b in blocks:
            block_obj = Block(b, user_id, post_id)
            #freq_dicts.append(block_obj.freq_dict)
            block_refs.append(block_obj.to_dbref())
            self.get(discussion_id).history_blocks.append(block_obj)
        post_obj.blocks = block_refs
        self.get(discussion_id).history.append(post_obj)
        
        #post_obj.freq_dict = utils.sum_dicts(freq_dicts)

        post_id = post_obj._id
        self.gm.user_manager.insert_post_user_history(user_id, discussion_id, post_id)

        post_info = {
            "post_id": post_obj._id,
            "blocks": post_obj.blocks,
            "created_at": post_obj.created_at,
            "author_name": self.get_user_name(discussion_id, user_id)
        }
        return post_info

    def get_post(self, discussion_id, post_id):
        discussion_obj = self.get(discussion_id)
        post_obj = discussion_obj.history[post_id]
        return post_obj

    def _get_post_ids(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        return list(discussion_obj.history.keys())

    def _get_block_ids(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        return list(discussion_obj.history_blocks.keys())

    def get_posts(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        history = discussion_obj.history
        return list(history.values())  # give data

    def get_posts_flattened(self, discussion_id):
        posts = self.get_posts(discussion_id)
        posts_info = [{
            "post_id": p._id,
            "author": p.user,
            "author_name": self.get_user_name(discussion_id, p.user),
            "created_at": p.created_at,
            "blocks": [b._id for b in p.blocks],
        } for p in posts]
        return posts_info

    def get_block(self, discussion_id, block_id):
        discussion_obj = self.get(discussion_id)
        try:
            block_obj = discussion_obj.history_blocks[block_id]
        except:
            block_obj = None
        return block_obj

    def get_block_flattened(self, discussion_id, block_id):
        block_obj = self.get_block(discussion_id, block_id)
        if block_obj is not None:
            block_info = {
                "block_id": block_obj._id,
                "body": block_obj.body,
                "tags": block_obj.tags,
            }
        else:
            block_info = None
        return block_info

    def get_blocks(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        history_blocks = discussion_obj.history_blocks
        return list(history_blocks.values())  # give data

    def _is_tag(self, discussion_id, tag):
        discussion_obj = self.get(discussion_id)
        return tag in discussion_obj.internal_tags

    def _get_tag(self, discussion_id, tag):
        assert(self._is_tag(discussion_id, tag))
        discussion_obj = self.get(discussion_id)
        tag_data = discussion_obj.internal_tags[tag]
        return tag_data

#     def _is_tag_owner_post(self, discussion_id, user_id, post_id, tag):
#         assert(self._is_tag(discussion_id, tag))
#         post_data = self.get_post(discussion_id, post_id)
#         assert(tag in post_data["tags"])
#         return post_data["tags"][tag]["owner"]

    def _is_tag_owner_block(self, discussion_id, user_id, block_id, tag):
        assert(self._is_tag(discussion_id, tag))
        block_obj = self.get_block(discussion_id, block_id)
        assert(tag in block_obj.tags)
        return block_obj.tags[tag]["owner"]

    def _create_tag(self, discussion_id, tag):
        if not self._is_tag(discussion_id, tag):
            tag_obj = Tag(tag)
            tag_data = tag_obj.__dict__
            temp = self.get(discussion_id).internal_tags
            temp[tag] = tag_data
            self.get(discussion_id).update(internal_tags=temp)
        else:
            tag_data = self._get_tag(discussion_id, tag)
        return tag_data

#     def _is_tag_post(self, discussion_id, post_id, tag):
#         """
#         Only use this once the tag has been created for the discussion.
#         """
#         assert(self._is_tag(discussion_id, tag))
#         post_data = self.get_post(discussion_id, post_id)
#         return tag in post_data["tags"]
# 
#     def post_add_tag(self, discussion_id, user_id, post_id, tag):
#         self._create_tag(discussion_id, tag)
#         if not self._is_tag_post(discussion_id, post_id, tag):
#             self.discussions.update_one(
#                 {"_id": discussion_id},
#                 {"$set": {
#                     "history.{}.tags.{}".format(
#                         post_id, tag): {"owner": user_id}
#                 }
#                 }
#             )
# 
#     def post_remove_tag(self, discussion_id, user_id, post_id, tag):
#         if self._is_tag_post(discussion_id, post_id, tag):
#             if self._is_tag_owner_post(discussion_id, user_id, post_id, tag):
#                 self.discussions.update_one(
#                     {"_id": discussion_id},
#                     {"$unset": {
#                         "history.{}.tags.{}".format(
#                             post_id, tag): 0
#                     }
#                     }
#                 )

    def _is_tag_block(self, discussion_id, block_id, tag):
        """
        Only use this once the tag has been created for the discussion.
        """
        assert(self._is_tag(discussion_id, tag))
        block_obj = self.get_block(discussion_id, block_id)
        return tag in block_obj.tags

    def block_add_tag(self, discussion_id, user_id, block_id, tag):
        self._create_tag(discussion_id, tag)
        if not self._is_tag_block(discussion_id, block_id, tag):
            temp = self.get(discussion_id).history_blocks.filter(_id=block_id)
            temp[tag] = {"owner": user_id}
            self.get(discussion_id).history_blocks.filter(_id=block_id).update(tags=temp)

    def block_remove_tag(self, discussion_id, user_id, block_id, tag):
        if self._is_tag_block(discussion_id, block_id, tag):
            if self._is_tag_owner_block(discussion_id, user_id, block_id, tag):
                temp = self.get(discussion_id).history_blocks.filter(_id=block_id)
                del temp[tag]
                self.get(discussion_id).history_blocks.filter(_id=block_id).update(tags=temp)

#     def discussion_scope_search(self, discussion_id, query):
#         posts_data = self.get_posts(discussion_id)
#         blocks_data = self.get_blocks(discussion_id)
#         return basic_search(query, blocks_data, posts_data)
# 
#     def discussion_tag_search(self, discussion_id, tags):
#         posts_data = self.get_posts(discussion_id)
#         blocks_data = self.get_blocks(discussion_id)
#         return tag_search(tags, blocks_data, posts_data)

    def get_user_saved_posts(self, discussion_id, user_id):
        post_ids = self.gm.user_manager.get_user_saved_post_ids(user_id, discussion_id)
        posts = [self.get_post(discussion_id, p) for p in post_ids]
        return posts

    def get_user_saved_blocks(self, discussion_id, user_id):
        block_ids = self.gm.user_manager.get_user_saved_block_ids(user_id, discussion_id)
        blocks = [self.get_block(discussion_id, b) for b in block_ids]
        return blocks

#     def user_saved_scope_search(self, discussion_id, user_id, query):
#         posts_data = self.get_user_saved_posts(discussion_id, user_id)
#         blocks_data = self.get_user_saved_blocks(discussion_id, user_id)
#         return basic_search(query, blocks_data, posts_data)
# 
#     def user_saved_tag_search(self, discussion_id, user_id, tags):
#         posts_data = self.get_user_saved_posts(discussion_id, user_id)
#         blocks_data = self.get_user_saved_blocks(discussion_id, user_id)
#         return tag_search(tags, blocks_data, posts_data)

    def _transclusion_get_body(self, text):
        match_res = constants.transclusion_header.match(text)
        if match_res:
            return text[len(match_res[0]):]
        else:
            return text

    def _transclusion_get_id(self, text):
        match_res = constants.transclusion_header.match(text)
        if match_res:
            return match_res[0][11:-1]  # get stuff between "transclude<" and ">"
        else:
            return None

    def _get_block_limit(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        return discussion_obj.block_char_limit

    def _get_summary_char_left(self, discussion_id):
        discussion_obj = self.get(discussion_id)
        return discussion_obj.summary_char_left

    def _set_summary_char_left(self, discussion_id, new_limit):
        self.get(discussion_id).update(summary_char_left=new_limit)

    def get_summary_block(self, discussion_id, block_id):
        discussion_obj = self.get(discussion_id)
        return discussion_obj.summary_blocks.filter(_id=block_id).get()

    def summary_add_block(self, discussion_id, body):
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

        block_obj = Block(body)
        block_id = block_obj._id
        self.get(discussion_id).history_blocks.append(block_obj)
        self.get(discussion_id).summary_blocks.append(block_obj)
        return block_id, None

    def summary_modify_block(self, discussion_id, block_id, body):
        # should not be getting transclusions when modifying
        block_obj = self.get_summary_block(discussion_id, block_id)
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

        self.get(discussion_id).summary_blocks.filter(_id=block_id).update(body=body)
        return None

    def summary_remove_block(self, discussion_id, block_id):
        self.get(discussion_id).summary_blocks.filter(_id=block_id).delete()
