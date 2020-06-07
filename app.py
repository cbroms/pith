from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from json import dumps, JSONEncoder
from uuid import UUID
import utils
from user import User
from post import Post
from block import Block


app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')
CORS(app)


class UUIDEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return obj.hex
        return JSONEncoder.default(self, obj)


@socketio.on('connect')
def test_connect():
    emit('~connect', {'data': 'Connected'})


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


@socketio.on('get_users')
def get_users(json):
    on_event = '~get_users'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(utils.get_users(), cls=UUIDEncoder))


@socketio.on('get_posts')
def get_posts(json):
    on_event = '~get_posts'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(utils.get_posts(), cls=UUIDEncoder))


@socketio.on('get_blocks')
def get_blocks(json):
    on_event = '~get_blocks'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(utils.get_blocks(), cls=UUIDEncoder))


@socketio.on('get_user')
def get_user(json):
    user_id = json["user_id"]
    user_data = utils.get_user(user_id) 
    on_event = '~get_user'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(user_data, cls=UUIDEncoder))


@socketio.on('get_post')
def get_post(json):
    post_id = json["post_id"]
    post_data = utils.get_post(post_id) 
    on_event = '~get_post'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(post_data, cls=UUIDEncoder))


@socketio.on('get_block')
def get_block(json):
    block_id = json["block_id"]
    block_data = utils.get_block(block_id)
    on_event = '~get_block'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(block_data, cls=UUIDEncoder))


@socketio.on('save_post')
def save_post(json):
    post_id = json["post_id"]
    user_id = json["user_id"]
    user_obj = utils.get_user_obj(user_id)
    user_obj.library["posts"].append(post_id)
    utils.update_user(user_obj)
    user_data = user_obj.__dict__
    on_event = '~save_post'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(user_data, cls=UUIDEncoder))


@socketio.on('save_block')
def save_block(json):
    block_id = json["block_id"]
    user_id = json["user_id"]
    user_obj = utils.get_user_obj(user_id)
    user_obj.library["blocks"].append(block_id)
    utils.update_user(user_obj)
    user_data = user_obj.__dict__
    on_event = '~save_block'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(user_data, cls=UUIDEncoder))


@socketio.on('post_add_tag')
def post_add_tag(json): 
    post_id = json["post_id"]
    tag = json["tag"]
    post_obj = utils.get_post_obj(post_id)
    post_obj.tags.append(tag)
    utils.update_post(post_obj)
    post_data = post_obj.__dict__
    on_event = '~post_add_tag'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(post_data, cls=UUIDEncoder))


@socketio.on('block_add_tag')
def block_add_tag(json): 
    block_id = json["block_id"]
    tag = json["tag"]
    block_obj = utils.get_block_obj(block_id)
    block_obj.tags.append(tag)
    utils.update_block(block_obj)
    block_data = block_obj.__dict__
    on_event = '~block_add_tag'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(block_data, cls=UUIDEncoder))


@socketio.on('create_user')
def create_user(json):
    ip = json["user_id"]
    user_obj = User(ip)
    utils.insert_user(user_obj)
    user_data = user_obj.__dict__
    on_event = '~create_user'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(user_data, cls=UUIDEncoder))


@socketio.on('create_post')
def create_post(json):
    user_id = json["user_id"]
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
    on_event = '~create_post'
    if "event_instance" in json:
        on_event = on_event + ':' + json["event_instance"]
    emit(on_event, dumps(post_data, cls=UUIDEncoder))


if __name__ == '__main__':
    app.run()
