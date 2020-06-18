import sys
sys.path.append('.')

import database

from models.discussion import Discussion
from models.user import User
from models.post import Post
from models.block import Block


test_user = User(0)
test_discussion = Discussion()
test_post = Post(test_user._id, test_discussion._id)
test_block = Block(test_user._id, test_discussion._id, test_post._id, 
    "Test message for you to you.")
test_post.blocks = [test_block._id]
test_post.freq_dict = test_block.freq_dict.copy() # should be defaultdict

print("insert_discussion...")
database.insert_discussion(test_discussion)
print("insert_user...")
database.insert_user(test_user)
print("insert_post...")
database.insert_post(test_post)
print("insert_block...")
database.insert_block(test_block)
print("join discussion...")
database.join_discussion(test_discussion._id, test_user._id)
print()

print("get_discussion: {}".format(
    database.get_discussion(test_discussion._id)
))
print("get_user: {}".format(
    database.get_user(test_user._id)
))
print("get_post: {}".format(
    database.get_post(test_post._id)
))
print("get_block: {}".format(
    database.get_block(test_block._id)
))
print()

print("add tag to discussion...")
database.discussion_add_tag(test_discussion._id, "discussion_tag")
print("add tag to post...")
database.post_add_tag(test_post._id, "post_tag")
print("add tag to block...")
database.block_add_tag(test_block._id, "block_tag")
print("save discussion...")
database.save_discussion(test_discussion._id, test_user._id)
print("save post...")
database.save_post(test_post._id, test_user._id)
print("save block...")
database.save_block(test_block._id, test_user._id)
print("post to user history...")
database.insert_post_user_history(test_user._id, test_post._id)
print("post to discussion history...")
database.insert_post_discussion_history(test_discussion._id, test_post._id)
print()

print("get_discussions: {}".format(
    database.get_discussions()
))
print("get_discussion_users: {}".format(
    database.get_discussion_users(test_discussion._id)
))
print("get_discussion_posts: {}".format(
    database.get_discussion_posts(test_discussion._id)
))
print("get_discussion_blocks: {}".format(
    database.get_discussion_blocks(test_discussion._id)
))
print("get_user_saved_discussions: {}".format(
    database.get_user_saved_discussions(test_user._id)
))
print("get_user_saved_posts: {}".format(
    database.get_user_saved_posts(test_user._id)
))
print("get_user_saved_blocks: {}".format(
    database.get_user_saved_blocks(test_user._id)
))
print()

print("indexing block...") 
database.index_block(test_block._id, test_block.freq_dict)
print("indexing post...")
database.index_post(test_post._id, test_post.freq_dict)
print()

print("blocks with 'you'", database.get_keyword_blocks("you"))
print("posts with 'you'", database.get_keyword_posts("you"))
print()

print("remove tag from discussion...")
database.discussion_remove_tag(test_discussion._id, "discussion_tag")
print("remove tag from post...")
database.post_remove_tag(test_post._id, "post_tag")
print("remove tag from block...")
database.block_remove_tag(test_block._id, "block_tag")
print("leave discussion...")
database.leave_discussion(test_discussion._id, test_user._id)
print()

print("get_discussion: {}".format(
    database.get_discussion(test_discussion._id)
))
print("get_users: {}".format(
    database.get_users()
))
print("get_posts: {}".format(
    database.get_posts()
))
print("get_blocks: {}".format(
    database.get_blocks()
))
print()
