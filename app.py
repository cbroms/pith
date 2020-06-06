from flask import Flask, jsonify
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
            # if the obj is uuid, we simply return the value of uuid
            return obj.hex
        return JSONEncoder.default(self, obj)


@socketio.on('connect')
def test_connect():
    emit('~connect', {'data': 'Connected'})


@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')


#@app.route('/user', methods=["GET"])
@socketio.on('get_users')
def get_users(json):
    emit('~get_users', dumps(utils.get_users(), cls=UUIDEncoder))


#@app.route('/post', methods=["GET"])
@socketio.on('get_posts')
def get_posts(json):
    emit('~get_posts', dumps(utils.get_posts(), cls=UUIDEncoder))


#@app.route('/block', methods=["GET"])
@socketio.on('get_blocks')
def get_blocks(json):
    emit('~get_blocks', dumps(utils.get_blocks(), cls=UUIDEncoder))


#@app.route('/user/<:user>', methods=["GET"])
@socketio.on('get_user')
def get_user(json):
    user_id = json.user_id
    user_data = utils.get_user(user_id) 
    emit('~get_user', dumps(user_data, cls=UUIDEncoder))


#@app.route('/post/<:post>', methods=["GET"])
@socketio.on('get_post')
def get_post(json):
    post_id = json.post_id
    post_data = utils.get_post(post_id) 
    emit('~get_post', dumps(post_data, cls=UUIDEncoder))


#@app.route('/block/<:block>', methods=["GET"])
@socketio.on('get_block')
def get_block(json):
    block_id = json.block_id
    block_data = utils.get_block(block_id)
    emit('~get_block', dumps(block_data, cls=UUIDEncoder))


#@app.route('/user/<:user>/post/save', methods=["POST"])
@socketio.on('save_post')
def save_post(json):
    post_id = json.post
    user_obj = get_user_obj(user_id)
    user_obj.library["posts"].append(post_id)
    utils.insert_user(user_obj)
    post_data = post_obj.__dict__
    emit('~save_post', dumps(post_data, cls=UUIDEncoder))


#@app.route('/user/<:user>/block/save', methods=["POST"])
@socketio.on('save_block')
def save_block(json):
    block_id = json.block
    user_obj = get_user_obj(user_id)
    user_obj.library["blocks"].append(block_id)
    utils.insert_user(user_obj)
    block_data = block_obj.__dict__
    emit('~save_block', dumps(block_data, cls=UUIDEncoder))


#@app.route('/posts/<:post>/tag/create', methods=["POST"])
@socketio.on('post_add_tag')
def post_add_tag(json): 
    post_id = json.post_id
    tag = json.tag
    post_obj = get_post_obj(post_id)
    post_obj.tags.append(tag)
    utils.insert_post(post_obj)
    post_data = post_obj.__dict__
    emit('~post_add_tag', dumps(post_data, cls=UUIDEncoder))


#@app.route('/blocks/<:block>/tag/create', methods=["PUT"])
@socketio.on('post_add_tag')
def block_add_tag(json): 
    block_id = json.block_id
    tag = json.tag
    block_obj = get_block_obj(block_id)
    block_obj.tags.append(tag)
    utils.insert_block(block_obj)
    block_data = block_obj.__dict__
    emit('~block_add_tag', dumps(block_data, cls=UUIDEncoder))


#@app.route('/user/<:user>', methods=["POST"])
@socketio.on('create_user')
def create_user(json):
    ip = json.ip
    user_obj = User(ip)
    utils.insert_user(user_obj)
    user_data = user_obj.__dict__
    send(user_data, json=True)
    emit('~create_user', dumps(user_data, cls=UUIDEncoder))


#@app.route('/user/<:user>/post/create', methods=["POST"])
@socketio.on('create_post')
def create_post(json):
    user_id = json.user_id
    user_obj = get_user_obj(user_id)

    post_obj = Post(user_obj._id)

    blocks = json.blocks
    # TODO more processing needed?
    block_ids = []
    for b in blocks:
        block_obj = Block(user_obj._id, post_obj._id, b) # TODO b 
        blocks_ids.append(block_obj._id)
        utils.insert_block(block_obj)

    post_obj.blocks = blocks_ids
    utils.insert_post(post_obj)

    user_obj.history.append(post_obj._id)
    utils.insert_user(user_obj)

    post_data = post_obj.__dict__
    send(post_data, json=True)
    emit('~create_post', dumps(user_data, cls=UUIDEncoder))


if __name__ == '__main__':
    app.run()
