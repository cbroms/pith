"""
sudo service mongodb start
-------------------------------
sudo service mongodb stop
"""
import sys
sys.path.append("..")

import utils
from user import User
from post import Post
from block import Block


print("get_users: ", utils.get_users())
print("get_posts: ", utils.get_posts())
print("get_blocks: ", utils.get_blocks())

test_user = User(0)
test_post = Post(test_user._id)
test_block = Block(test_user._id, test_post._id, "Test message.")
test_post.blocks = [test_block._id]
test_user.history.append(test_post._id)

print("insert_user: ", utils.insert_user(test_user))
print("insert_post: ", utils.insert_post(test_post))
print("insert_block: ", utils.insert_block(test_block))

print(utils.get_user(test_user._id)["_id"] == test_user._id)
print(utils.get_post(test_post._id)["_id"] == test_post._id)
print(utils.get_block(test_block._id)["_id"] == test_block._id)

print(utils.get_user_obj(test_user._id).__dict__ == test_user.__dict__)
print(utils.get_post_obj(test_post._id).__dict__ == test_post.__dict__)
print(utils.get_block_obj(test_block._id).__dict__ == test_block.__dict__)

print("get_users: ",utils.get_users())
print("get_posts: ",utils.get_posts())
print("get_blocks: ",utils.get_blocks())
