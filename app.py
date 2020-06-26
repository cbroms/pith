
import socketio

from collections import defaultdict
# from flask import Flask
# from flask_socketio import SocketIO, emit
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


# app = Flask(__name__)
# socketio = SocketIO(app, cors_allowed_origins='*')

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=["http://localhost:3000", "https://dev1.pith.rainflame.com"])
app = socketio.ASGIApp(sio)


class UUIDEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return obj.hex
        return JSONEncoder.default(self, obj)


@sio.on('connect')
async def test_connect(sid, json):
    print('Client connected')


@sio.on('disconnect')
async def test_disconnect(sid):
    print('Client disconnected')


# get a list of all discussions
@sio.on('get_discussions')
async def get_discussions(sid, json):
    return dumps(database.get_discussions(), cls=UUIDEncoder)


# get a list of all users
@sio.on('get_users')
async def get_users(sid):
    return dumps(database.get_users(), cls=UUIDEncoder)


# get a list of all posts
@sio.on('get_posts')
async def get_posts(sid):
    return dumps(database.get_posts(), cls=UUIDEncoder)


# get a list of all blocks
@sio.on('get_blocks')
async def get_blocks(sid):
    return dumps(database.get_blocks(), cls=UUIDEncoder)


# get a list of all users for the discussion
@sio.on('get_discussion_users')
async def get_discussion_users(sid, json):
    discussion_id = json["discussion_id"]
    return dumps(database.get_discussion_users(discussion_id), cls=UUIDEncoder)


# get a list of all posts for the discussion
@sio.on('get_discussion_posts')
async def get_discussion_posts(sid, json):
    discussion_id = json["discussion_id"]
    return dumps(database.get_discussion_posts(discussion_id), cls=UUIDEncoder)


# get a list of all blocks for the discussion
@sio.on('get_discussion_blocks')
async def get_discussion_blocks(sid, json):
    discussion_id = json["discussion_id"]
    return dumps(database.get_discussion_blocks(discussion_id), cls=UUIDEncoder)


# get a specific user with ID (IP address in base64)
@sio.on('get_user')
async def get_user(sid, json):
    user_id = json["user_id"]
    user_data = database.get_user(user_id) 
    return dumps(user_data, cls=UUIDEncoder)


# check if a user exists, then add a new one if not
@sio.on('create_user')
async def create_user(sid, json):
    ip = json["user_id"]
   
    # try getting the user first
    user_data = database.get_user(ip)
    if user_data == None:
        user_obj = User(ip)
        database.insert_user(user_obj)
        user_data = user_obj.__dict__

    return dumps(user_data, cls=UUIDEncoder)


@sio.on('get_discussion')
async def get_discussion(sid, json):
    discussion_id = json["discussion_id"]
    discussion_data = database.get_discussion(discussion_id) 
    return dumps(discussion_data, cls=UUIDEncoder)


@sio.on('get_post')
async def get_post(sid, json):
    post_id = json["post_id"]
    post_data = database.get_post(post_id) 
    return dumps(post_data, cls=UUIDEncoder)


@sio.on('get_block')
async def get_block(sid, json):
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


@sio.on('save_discussion')
async def save_discussion(sid, json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]

    database.save_discussion(discussion_id, user_id)

    discussion_data = database.get_discussion(discussion_id)
    serialized = dumps(discussion_data, cls=UUIDEncoder)

    # emit the event for the user that just added the block
    await sio.emit("discussion_saved", serialized, to=sid)
    return serialized


@sio.on('save_post')
async def save_post(sid, json):
    post_id = json["post_id"]
    user_id = json["user_id"]

    database.save_post(post_id, user_id)

    post_data = database.get_post(post_id)
    serialized = dumps(post_data, cls=UUIDEncoder)

    # emit the event for the user that just added the block
    await sio.emit("post_saved", serialized, to=sid)
    return serialized


@sio.on('save_block')
async def save_block(sid, json):
    block_id = json["block_id"]
    user_id = json["user_id"]

    database.save_block(block_id, user_id)
    
    block_data = database.get_block(block_id)
    saved_blocks = database.get_user_saved_blocks(user_id)
    
    block_data["saved"] = True
    serialized = dumps(block_data, cls=UUIDEncoder)
    # emit the event for the user that just added the block
    await sio.emit("updated_block", serialized, to=sid)
    return serialized

@sio.on('unsave_block')
async def unsave_block(sid, json):
    block_id = json["block_id"]
    user_id = json["user_id"]

    database.unsave_block(block_id, user_id)
    
    block_data = database.get_block(block_id)
    block_data["saved"] = False
    serialized = dumps(block_data, cls=UUIDEncoder)
    # emit the event for the user that just added the block
    await sio.emit("updated_block", serialized, to=sid)
    return serialized


@sio.on('get_saved_discussions')
async def get_saved_discussions(sid, json):
    user_id = json["user_id"]
    discussions = database.get_user_saved_discussions(user_id)
    return dumps(discussions, cls=UUIDEncoder)


@sio.on('get_saved_posts')
async def get_saved_posts(sid, json):
    user_id = json["user_id"]
    posts = database.get_user_saved_posts(user_id)
    return dumps(posts, cls=UUIDEncoder)


@sio.on('get_saved_blocks')
async def get_saved_blocks(sid, json):
    user_id = json["user_id"]
    blocks = database.get_user_saved_blocks(user_id)
    return dumps(blocks, cls=UUIDEncoder)


@sio.on('discussion_add_tag')
async def discussion_add_tag(sid, json): 
    discussion_id = json["discussion_id"]
    tag = json["tag"]
    
    database.discussion_add_tag(discussion_id, tag)

    discussion_data = database.get_discussion(discussion_id)

    serialized = dumps(discussion_data, cls=UUIDEncoder)
    await sio.emit("discussion_add_tag", serializedm, to=sid)
    return serialized


@sio.on('post_add_tag')
async def post_add_tag(sid, json): 
    post_id = json["post_id"]
    tag = json["tag"]
    
    database.post_add_tag(post_id, tag)

    post_data = database.get_post(post_id)

    serialized = dumps(post_data, cls=UUIDEncoder)
    await sio.emit("post_add_tag", serialized, to=sid)
    return serialized


@sio.on('block_add_tag')
async def block_add_tag(sid, json): 
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
    await sio.emit("updated_block", serialized)
    return serialized


@sio.on('discussion_remove_tag')
async def discussion_remove_tag(sid, json): 
    discussion_id = json["discussion_id"]
    tag = json["tag"]
    
    database.discussion_remove_tag(discussion_id, tag)

    discussion_data = database.get_discussion(discussion_id)

    serialized = dumps(discussion_data, cls=UUIDEncoder)

    await sio.emit("discussion_remove_tag", serialized, to=sid)
    return serialized


@sio.on('post_remove_tag')
async def post_remove_tag(sid, json): 
    post_id = json["post_id"]
    tag = json["tag"]
    
    database.post_remove_tag(post_id, tag)

    post_data = database.get_post(post_id)

    serialized = dumps(post_data, cls=UUIDEncoder)

    await sio.emit("updated_post", serialized, to=sid)
    return serialized


@sio.on('block_remove_tag')
async def block_remove_tag(sid, json): 
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

    await sio.emit("updated_block", serialized)
    return serialized


@sio.on('create_discussion')
async def create_discussion(sid, json):
    discussion_obj = Discussion()
    database.insert_discussion(discussion_obj)

    discussion_data = discussion_obj.__dict__

    serialized = dumps(discussion_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    await sio.emit("discussion_created", serialized)

    return serialized


@sio.on('join_discussion')
async def join_discussion(sid, json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    database.join_discussion(discussion_id, user_id)

    discussion_data = database.get_discussion(discussion_id)

    serialized = dumps(discussion_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    await sio.emit("join_discussion", serialized)

    return serialized


@sio.on('leave_discussion')
async def leave_discussion(sid, json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    database.leave_discussion(discussion_id, user_id)

    discussion_data = database.get_discussion(discussion_id)

    serialized = dumps(discussion_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    await sio.emit("leave_discussion", serialized)

    return serialized


@sio.on('create_post')
async def create_post(sid, json):
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
    await sio.emit("post_created", serialized)

    return serialized


@sio.on('search_all')
async def search_all(sid, json):
    query = json["query"]
    block_ids, post_ids = all_scope_search(query)
    result = {"blocks": block_ids, "posts": post_ids}
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


@sio.on('search_discussion')
async def search_discussion(sid, json):
    query = json["query"]
    discussion_id = json["discussion_id"]
    block_ids, post_ids = discussion_scope_search(query, discussion_id)
    result = {"blocks": block_ids, "posts": post_ids}
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


@sio.on('search_user_saved')
async def search_user_saved(sid, json):
    query = json["query"]
    user_id = json["user_id"]
    block_ids, post_ids = user_saved_scope_search(query, user_id)
    result = {"blocks": block_ids, "posts": post_ids}
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


if __name__ == '__main__':
    app.run()
