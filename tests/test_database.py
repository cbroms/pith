import sys
sys.path.append('.')

import database

from models.user import User
from models.post import Post
from models.block import Block


test_user = User(0)
test_post = Post(test_user._id)
test_block = Block(test_user._id, test_post._id, "Test message for you to you.")

print("insert_user...")
database.insert_user(test_user)
print("insert_post...")
database.insert_post(test_post)
print("insert_block...")
database.insert_block(test_block)
print()

print("get_user: {}".format(
    database.get_user(test_user._id)["_id"] == test_user._id
))
print("get_post: {}".format(
    database.get_post(test_post._id)["_id"] == test_post._id
))
print("get_block: {}".format(
    database.get_block(test_block._id)["_id"] == test_block._id
))
print()

print("get_user_obj: {}".format(
    database.get_user_obj(test_user._id).__dict__ == test_user.__dict__
))
print("get_post_obj: {}".format(
    database.get_post_obj(test_post._id).__dict__ == test_post.__dict__
))
print("get_block_obj: {}".format(
    database.get_block_obj(test_block._id).__dict__ == test_block.__dict__
))
print()

print("add tag to post...")
database.post_add_tag(test_post._id, "post_tag")
print("add tag to block...")
database.block_add_tag(test_block._id, "block_tag")
print("save post...")
database.save_post(test_post._id, test_user._id)
print("save block...")
database.save_block(test_block._id, test_user._id)
print("post to history...")
database.insert_post_history(test_user._id, test_post._id)
print()

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

test_post.freq_dict = test_block.freq_dict.copy()

print("indexing block...") 
database.index_block(test_block._id, test_block.freq_dict)
print("indexing post...")
database.index_post(test_post._id, test_post.freq_dict)
print()

print("blocks with 'you'", database.get_keyword_blocks("you"))
print("posts with 'you'", database.get_keyword_posts("you"))

print("remove tag from post...")
database.post_remove_tag(test_post._id, "post_tag")
print("remove tag from block...")
database.block_remove_tag(test_block._id, "block_tag")

print("get_posts: {}".format(
    database.get_post(test_post._id)
))
print("get_blocks: {}".format(
    database.get_block(test_block._id)
))
print()
