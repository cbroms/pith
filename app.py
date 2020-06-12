from flask import Flask
from flask_socketio import SocketIO, emit
from json import dumps, JSONEncoder
from uuid import UUID

from models.user import User
from models.post import Post
from models.block import Block

import utils
import database


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


# get a list of all user IDs 
@socketio.on('get_users')
def get_users():
    return dumps(database.get_users(), cls=UUIDEncoder)


# get a list of all posts for a given discussion
@socketio.on('get_posts')
def get_posts():
    return dumps(database.get_posts(), cls=UUIDEncoder)


# get a list of all blocks for a given discussion
@socketio.on('get_blocks')
def get_blocks():
    return dumps(database.get_blocks(), cls=UUIDEncoder)


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


@socketio.on('get_post')
def get_post(json):
    post_id = json["post_id"]
    post_data = database.get_post(post_id) 
    return dumps(post_data, cls=UUIDEncoder)


@socketio.on('get_block')
def get_block(json):
    block_id = json["block_id"]
    block_data = database.get_block(block_id)
    return dumps(block_data, cls=UUIDEncoder)


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
    serialized = dumps(block_data, cls=UUIDEncoder)

    # emit the event for the user that just added the block
    emit("block_saved", serialized)
    return serialized


@socketio.on('get_saved_posts')
def get_saved_posts(json):
    user_id = json["user_id"]
    user_obj = database.get_user_obj(user_id)
    posts = user_obj.library["posts"]
    return dumps(posts, cls=UUIDEncoder)


@socketio.on('get_saved_blocks')
def get_saved_blocks(json):
    user_id = json["user_id"]
    user_obj = database.get_user_obj(user_id)
    blocks = user_obj.library["blocks"]
    return dumps(blocks, cls=UUIDEncoder)


@socketio.on('post_add_tag')
def post_add_tag(json): 
    post_id = json["post_id"]
    tag = json["tag"]
    
    database.post_add_tag(post_id, tag)

    post_data = database.get_post(post_id)

    serialized = dumps(post_data, cls=UUIDEncoder)

    # emit the event for the user that just added the post
    emit("post_add_tag", serialized)
    return serialized


@socketio.on('block_add_tag')
def block_add_tag(json): 
    block_id = json["block_id"]
    tag = json["tag"]
    
    database.block_add_tag(block_id, tag)

    block_data = database.get_block(block_id)

    serialized = dumps(block_data, cls=UUIDEncoder)

    # emit the event for the user that just added the block
    emit("block_add_tag", serialized)
    return serialized


@socketio.on('create_post')
def create_post(json):
    print(json)
    user_id = json["user_id"]
    # add discussion ID here too
    # discussion_id = json["discussion_id"]

    post_obj = Post(user_obj._id)

    blocks = json["blocks"]
    block_ids = []
    freq_dicts = []
    for b in blocks:
        block_obj = Block(user_id, post_obj._id, b)
        freq_dicts.append(block_obj.freq_dict)
        block_ids.append(block_obj._id)
        database.insert_block(block_obj)

    post_obj.blocks = block_ids
    post_freq_dict = utils.sum_dicts(freq_dicts)
    post_obj.freq_dict = post_freq_dict
    database.insert_post(post_obj)

    """
    user_obj = database.get_user_obj(user_id)
    user_obj.history.append(post_obj._id)
    database.update_user(user_obj)
    """
    database.insert_post_history(user_id, post_id)

    post_data = post_obj.__dict__

    serialized = dumps(post_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    emit("post_created", serialized, broadcast=True)

    return serialized


if __name__ == '__main__':
    app.run()
