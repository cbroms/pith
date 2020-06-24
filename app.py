from collections import defaultdict
from flask import Flask
from flask_socketio import SocketIO, emit
from json import dumps, JSONEncoder
from uuid import UUID

from models.discussion import Discussion
from models.user import User
from models.post import Post
from models.block import Block

from basic_search import (
    all_scope_search,
    discussion_scope_search,
    user_saved_scope_search,
)
import database
import utils


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')


class UUIDEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return obj.hex
        return JSONEncoder.default(self, obj)


@socketio.on('connect')
def test_connect():
    print('Client connected')


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


# get a list of all discussions
@socketio.on('get_discussions')
def get_discussions():
    return dumps(database.get_discussions(), cls=UUIDEncoder)


# get a list of all users
@socketio.on('get_users')
def get_users():
    return dumps(database.get_users(), cls=UUIDEncoder)


# get a list of all posts
@socketio.on('get_posts')
def get_posts():
    return dumps(database.get_posts(), cls=UUIDEncoder)


# get a list of all blocks
@socketio.on('get_blocks')
def get_blocks():
    return dumps(database.get_blocks(), cls=UUIDEncoder)


# get a list of all users for the discussion
@socketio.on('get_discussion_users')
def get_discussion_users(json):
    discussion_id = json["discussion_id"]
    return dumps(database.get_discussion_users(discussion_id), cls=UUIDEncoder)


# get a list of all posts for the discussion
@socketio.on('get_discussion_posts')
def get_discussion_posts(json):
    discussion_id = json["discussion_id"]
    return dumps(database.get_discussion_posts(discussion_id), cls=UUIDEncoder)


# get a list of all blocks for the discussion
@socketio.on('get_discussion_blocks')
def get_discussion_blocks(json):
    discussion_id = json["discussion_id"]
    return dumps(database.get_discussion_blocks(discussion_id), cls=UUIDEncoder)


# get a specific user with ID (IP address in base64)
@socketio.on('get_user')
def get_user(json):
    user_id = json["user_id"]
    user_data = database.get_user(user_id) 
    return dumps(user_data, cls=UUIDEncoder)


# check if a user exists, then add a new one if not
@socketio.on('create_user')
def create_user(json):
    ip = json["user_id"]
   
    # try getting the user first
    user_data = database.get_user(ip)
    if user_data == None:
        user_obj = User(ip)
        database.insert_user(user_obj)
        user_data = user_obj.__dict__

    return dumps(user_data, cls=UUIDEncoder)


@socketio.on('get_discussion')
def get_discussion(json):
    discussion_id = json["discussion_id"]
    discussion_data = database.get_discussion(discussion_id) 
    return dumps(discussion_data, cls=UUIDEncoder)


@socketio.on('get_post')
def get_post(json):
    post_id = json["post_id"]
    post_data = database.get_post(post_id) 
    return dumps(post_data, cls=UUIDEncoder)


@socketio.on('get_block')
def get_block(json):
    block_id = json["block_id"]
    user_id = json["user_id"]
    block_data = database.get_block(block_id)
    saved_blocks = database.get_user_saved_blocks(user_id)
    # print(user_id)
    # print(saved_blocks)
    # if the block is in the user's list of saved blocks, add that to the obj
    if block_id in saved_blocks:
        block_data["saved"] = True
    return dumps(block_data, cls=UUIDEncoder)


@socketio.on('save_discussion')
def save_discussion(json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]

    database.save_discussion(discussion_id, user_id)

    discussion_data = database.get_discussion(discussion_id)
    serialized = dumps(discussion_data, cls=UUIDEncoder)

    # emit the event for the user that just added the block
    emit("discussion_saved", serialized)
    return serialized


@socketio.on('save_post')
def save_post(json):
    post_id = json["post_id"]
    user_id = json["user_id"]

    database.save_post(post_id, user_id)

    post_data = database.get_post(post_id)
    serialized = dumps(post_data, cls=UUIDEncoder)

    # emit the event for the user that just added the block
    emit("post_saved", serialized)
    return serialized


@socketio.on('save_block')
def save_block(json):
    block_id = json["block_id"]
    user_id = json["user_id"]

    database.save_block(block_id, user_id)
    
    block_data = database.get_block(block_id)
    saved_blocks = database.get_user_saved_blocks(user_id)
    
    block_data["saved"] = True
    serialized = dumps(block_data, cls=UUIDEncoder)
    # emit the event for the user that just added the block
    emit("updated_block", serialized)
    return serialized

@socketio.on('unsave_block')
def unsave_block(json):
    block_id = json["block_id"]
    user_id = json["user_id"]

    database.unsave_block(block_id, user_id)
    
    block_data = database.get_block(block_id)
    block_data["saved"] = False
    serialized = dumps(block_data, cls=UUIDEncoder)
    # emit the event for the user that just added the block
    emit("updated_block", serialized)
    return serialized


@socketio.on('get_saved_discussions')
def get_saved_discussions(json):
    user_id = json["user_id"]
    discussions = database.get_user_saved_discussions(user_id)
    return dumps(discussions, cls=UUIDEncoder)


@socketio.on('get_saved_posts')
def get_saved_posts(json):
    user_id = json["user_id"]
    posts = database.get_user_saved_posts(user_id)
    return dumps(posts, cls=UUIDEncoder)


@socketio.on('get_saved_blocks')
def get_saved_blocks(json):
    user_id = json["user_id"]
    blocks = database.get_user_saved_blocks(user_id)
    return dumps(blocks, cls=UUIDEncoder)


@socketio.on('discussion_add_tag')
def discussion_add_tag(json): 
    discussion_id = json["discussion_id"]
    tag = json["tag"]
    
    database.discussion_add_tag(discussion_id, tag)

    discussion_data = database.get_discussion(discussion_id)

    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("discussion_add_tag", serialized)
    return serialized


@socketio.on('post_add_tag')
def post_add_tag(json): 
    post_id = json["post_id"]
    tag = json["tag"]
    
    database.post_add_tag(post_id, tag)

    post_data = database.get_post(post_id)

    serialized = dumps(post_data, cls=UUIDEncoder)
    emit("post_add_tag", serialized)
    return serialized


@socketio.on('block_add_tag')
def block_add_tag(json): 
    block_id = json["block_id"]
    user_id = json["user_id"]
    tag = json["tag"]
    
    database.block_add_tag(block_id, tag)

    block_data = database.get_block(block_id)
    saved_blocks = database.get_user_saved_blocks(user_id)
   # print(saved_blocks)
    # # if the block is in the user's list of saved blocks, add that to the obj
    if block_id in saved_blocks:
        block_data["saved"] = True

    serialized = dumps(block_data, cls=UUIDEncoder)
    emit("updated_block", serialized, broadcast=True)
    return serialized


@socketio.on('discussion_remove_tag')
def discussion_remove_tag(json): 
    discussion_id = json["discussion_id"]
    tag = json["tag"]
    
    database.discussion_remove_tag(discussion_id, tag)

    discussion_data = database.get_discussion(discussion_id)

    serialized = dumps(discussion_data, cls=UUIDEncoder)

    emit("discussion_remove_tag", serialized)
    return serialized


@socketio.on('post_remove_tag')
def post_remove_tag(json): 
    post_id = json["post_id"]
    tag = json["tag"]
    
    database.post_remove_tag(post_id, tag)

    post_data = database.get_post(post_id)

    serialized = dumps(post_data, cls=UUIDEncoder)

    emit("updated_post", serialized)
    return serialized


@socketio.on('block_remove_tag')
def block_remove_tag(json): 
    block_id = json["block_id"]
    user_id= json["user_id"]
    tag = json["tag"]
    
    database.block_remove_tag(block_id, tag)

    block_data = database.get_block(block_id)
    saved_blocks = database.get_user_saved_blocks(user_id)
    # # if the block is in the user's list of saved blocks, add that to the obj
    if block_id in saved_blocks:
        block_data["saved"] = True


    serialized = dumps(block_data, cls=UUIDEncoder)

    emit("updated_block", serialized, broadcast=True)
    return serialized


@socketio.on('create_discussion')
def create_discussion(json):
    discussion_obj = Discussion()
    database.insert_discussion(discussion_obj)

    discussion_data = discussion_obj.__dict__

    serialized = dumps(discussion_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    emit("discussion_created", serialized, broadcast=True)

    return serialized


@socketio.on('join_discussion')
def join_discussion(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    database.join_discussion(discussion_id, user_id)

    discussion_data = database.get_discussion(discussion_id)

    serialized = dumps(discussion_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    emit("join_discussion", serialized, broadcast=True)

    return serialized


@socketio.on('leave_discussion')
def leave_discussion(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    database.leave_discussion(discussion_id, user_id)

    discussion_data = database.get_discussion(discussion_id)

    serialized = dumps(discussion_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    emit("leave_discussion", serialized, broadcast=True)

    return serialized


@socketio.on('create_post')
def create_post(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    post_obj = Post(user_id, discussion_id)
    database.insert_post_user_history(user_id, post_obj._id)
    database.insert_post_discussion_history(discussion_id, post_obj._id)

    blocks = json["blocks"]
    block_ids = []
    freq_dicts = []
    for b in blocks:
        block_obj = Block(user_id, discussion_id, post_obj._id, b)
        freq_dicts.append(block_obj.freq_dict)
        block_ids.append(block_obj._id)
        database.insert_block_discussion_history(discussion_id, block_obj._id)
        database.insert_block(block_obj)
        database.index_block(block_obj._id, block_obj.freq_dict)

    post_obj.blocks = block_ids
    post_freq_dict = utils.sum_dicts(freq_dicts)
    post_obj.freq_dict = defaultdict(lambda:0, post_freq_dict)
    database.insert_post(post_obj)

    database.index_post(post_obj._id, post_obj.freq_dict)

    post_data = post_obj.__dict__

    serialized = dumps(post_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    emit("post_created", serialized, broadcast=True)

    return serialized


@socketio.on('search_all')
def search_all(json):
    query = json["query"]
    block_ids, post_ids = all_scope_search(query)
    result = {"blocks": block_ids, "posts": post_ids}
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


@socketio.on('search_discussion')
def search_discussion(json):
    query = json["query"]
    discussion_id = json["discussion_id"]
    block_ids, post_ids = discussion_scope_search(query, discussion_id)
    result = {"blocks": block_ids, "posts": post_ids}
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


@socketio.on('search_user_saved')
def search_user_saved(json):
    query = json["query"]
    user_id = json["user_id"]
    block_ids, post_ids = user_saved_scope_search(query, user_id)
    result = {"blocks": block_ids, "posts": post_ids}
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


if __name__ == '__main__':
    app.run()
