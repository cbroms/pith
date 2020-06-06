from flask import Flask, jsonify
from flask_socketio import SocketIO, send
import utils
from user import User
from post import Post
from block import Block


app = Flask(__name__)
socketio = SocketIO(app)


#@app.route('/user', methods=["GET"])
@socketio.on('get_users')
def get_users(json):
    return utils.get_users()


#@app.route('/post', methods=["GET"])
@socketio.on('get_posts')
def get_posts(json):
    return utils.get_posts()


#@app.route('/block', methods=["GET"])
@socketio.on('get_blocks')
def get_blocks(json):
    return utils.get_blocks()


#@app.route('/user/<:user>', methods=["GET"])
@socketio.on('get_user')
def get_user(json):
    user_id = json.user_id
    user_data = utils.get_user(user_id) 
    return user_data


#@app.route('/post/<:post>', methods=["GET"])
@socketio.on('get_post')
def get_post(json):
    post_id = json.post_id
    post_data = utils.get_post(post_id) 
    return post_data


#@app.route('/block/<:block>', methods=["GET"])
@socketio.on('get_block')
def get_block(json):
    block_id = json.block_id
    block_data = utils.get_block(block_id)
    return block_data


#@app.route('/user/<:user>/post/save', methods=["POST"])
@socketio.on('save_post')
def save_post(json):
    post_id = json.post
    user_obj = get_user_obj(user_id)
    user_obj.library["posts"].append(post_id)
    utils.insert_user(user_obj)


#@app.route('/user/<:user>/block/save', methods=["POST"])
@socketio.on('save_block')
def save_block(json):
    block_id = json.block
    user_obj = get_user_obj(user_id)
    user_obj.library["blocks"].append(block_id)
    utils.insert_user(user_obj)


#@app.route('/posts/<:post>/tag/create', methods=["POST"])
@socketio.on('post_add_tag')
def post_add_tag(json): 
    post_id = json.post_id
    tag = json.tag
    post_obj = get_post_obj(post_id)
    post_obj.tags.append(tag)
    utils.insert_post(post_obj)


#@app.route('/blocks/<:block>/tag/create', methods=["PUT"])
@socketio.on('post_add_tag')
def block_add_tag(json): 
    block_id = json.block_id
    tag = json.tag
    block_obj = get_block_obj(block_id)
    block_obj.tags.append(tag)
    utils.insert_block(block_obj)


#@app.route('/user/<:user>', methods=["POST"])
@socketio.on('create_user')
def create_user(json):
    ip = json.ip
    user_obj = User(ip)
    utils.insert_user(user_obj)


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
    return send(post_data, json=True)


if __name__ == '__main__':
    app.run()
