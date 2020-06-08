from flask import Flask
from flask_socketio import SocketIO, emit
from json import dumps, JSONEncoder
from uuid import UUID

from models.user import User
from models.post import Post
from models.block import Block

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


# get a list of all user IDs 
@socketio.on('get_users')
def get_users():
    return dumps(utils.get_users(), cls=UUIDEncoder)


# get a list of all posts for a given discussion
@socketio.on('get_posts')
def get_posts():
    return dumps(utils.get_posts(), cls=UUIDEncoder)


# get a specific user with ID (IP address in base64)
@socketio.on('get_user')
def get_user(json):
    user_id = json["user_id"]
    user_data = utils.get_user(user_id) 
    return dumps(user_data, cls=UUIDEncoder)


# check if a user exists, then add a new one if not
@socketio.on('create_user')
def create_user(json):
    ip = json["user_id"]

    # try getting the user first
    res = utils.get_user(ip)

    if res == None:
        user_obj = User(ip)
        utils.insert_user(user_obj)
        user_data = user_obj.__dict__
        return dumps(user_data, cls=UUIDEncoder)
    else:
        return dumps(res, cls=UUIDEncoder)



# @socketio.on('get_post')
# def get_post(json):
#     post_id = json["post_id"]
#     post_data = utils.get_post(post_id) 
#     on_event = '~get_post'
#     if "event_instance" in json:
#         on_event = on_event + ':' + json["event_instance"]
#     emit(on_event, dumps(post_data, cls=UUIDEncoder))


@socketio.on('get_block')
def get_block(json):
    block_id = json["block_id"]
    block_data = utils.get_block(block_id)
    return dumps(block_data, cls=UUIDEncoder)


# @socketio.on('save_post')
# def save_post(json):
#     post_id = json["post_id"]
#     user_id = json["user_id"]
#     user_obj = utils.get_user_obj(user_id)
#     user_obj.library["posts"].append(post_id)
#     utils.update_user(user_obj)
#     user_data = user_obj.__dict__
#     on_event = '~save_post'
#     if "event_instance" in json:
#         on_event = on_event + ':' + json["event_instance"]
#     emit(on_event, dumps(user_data, cls=UUIDEncoder))


# @socketio.on('save_block')
# def save_block(json):
#     block_id = json["block_id"]
#     user_id = json["user_id"]
#     user_obj = utils.get_user_obj(user_id)
#     user_obj.library["blocks"].append(block_id)
#     utils.update_user(user_obj)
#     user_data = user_obj.__dict__
#     on_event = '~save_block'
#     if "event_instance" in json:
#         on_event = on_event + ':' + json["event_instance"]
#     emit(on_event, dumps(user_data, cls=UUIDEncoder))


# @socketio.on('post_add_tag')
# def post_add_tag(json): 
#     post_id = json["post_id"]
#     tag = json["tag"]
#     post_obj = utils.get_post_obj(post_id)
#     post_obj.tags.append(tag)
#     utils.update_post(post_obj)
#     post_data = post_obj.__dict__
#     on_event = '~post_add_tag'
#     if "event_instance" in json:
#         on_event = on_event + ':' + json["event_instance"]
#     emit(on_event, dumps(post_data, cls=UUIDEncoder))


# @socketio.on('block_add_tag')
# def block_add_tag(json): 
#     block_id = json["block_id"]
#     tag = json["tag"]
#     block_obj = utils.get_block_obj(block_id)
#     block_obj.tags.append(tag)
#     utils.update_block(block_obj)
#     block_data = block_obj.__dict__
#     on_event = '~block_add_tag'
#     if "event_instance" in json:
#         on_event = on_event + ':' + json["event_instance"]
#     emit(on_event, dumps(block_data, cls=UUIDEncoder))



@socketio.on('create_post')
def create_post(json):
    print(json)
    user_id = json["user_id"]
    # add discussion ID here too
    # discussion_id = json["discussion_id"]

    user_obj = utils.get_user_obj(user_id)
    post_obj = Post(user_obj._id)

    blocks = json["blocks"]
    block_ids = []
    for b in blocks:
        block_obj = Block(user_obj._id, post_obj._id, b)
        block_ids.append(block_obj._id)
        utils.insert_block(block_obj)

    post_obj.blocks = block_ids
    utils.insert_post(post_obj)

    user_obj.history.append(post_obj._id)
    utils.update_user(user_obj)
    post_data = post_obj.__dict__

    serialized = dumps(post_data, cls=UUIDEncoder)

    #emit a new event for all listening clients 
    emit("post_created", serialized, broadcast=True)

    return serialized


if __name__ == '__main__':
    app.run()
