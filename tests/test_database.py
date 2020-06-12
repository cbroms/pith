import sys
sys.path.append("..")

import database

sys.path.append("../models/")

from user import User
from post import Post
from block import Block


test_user = User(0)
test_post = Post(test_user._id)
test_block = Block(test_user._id, test_post._id, "Test message.")

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

test_post.blocks = [test_block._id]
test_user.history.append(test_post._id)

print("update_post...")
database.update_post(test_post)
print("update_user...")
database.update_user(test_user)
# no block for now
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
