from flask import Flask, jsonify
from flask_socketio import SocketIO
from pymongo import MongoClient
import uuid


app = Flask(__name__)
socketio = SocketIO(app)
client = MongoClient('mongodb://localhost:27017')
db = client[db]
users = db["users"]
posts = db["posts"]
blocks = db["blocks"]


class User(Document):
    def __init__(self, ip, **entries):
        if entries:
            self.__dict__.update(entries)
        else:
            self.id = ip
            self.library = {}
            self.library["posts"] = [] # saved posts
            self.library["blocks"] = [] # saved blocks
            self.history = {} # list of posts

class Block(Document):
    def __init__(self, user, post, body, **entries):
        if entries:
            self.__dict__.update(entries)
        else:
            self.id = uuid.getnode()
            self.user = user
            self.post = post
            self.tags = []
            self.body = body

class Post(Document):
    def __init__(self, user, blocks=None, **entries):
        if entries:
            self.__dict__.update(entries)
        else:
            self.id = uuid.getnode()
            self.user = user
            self.tags = []
            self.blocks = blocks


#@app.route('/user', methods=["GET"])
@socketio.on('get_users')
def get_users(json):
    return users.find()


#@app.route('/post', methods=["GET"])
@socketio.on('get_posts')
def get_posts(json):
    return posts.find()


#@app.route('/block', methods=["GET"])
@socketio.on('get_blocks')
def get_blocks(json):
    return blocks.find()


#@app.route('/user/<:user>', methods=["GET"])
@socketio.on('get_user')
def get_user(json):
    user_id = json.user_id
    user_data = users.find_one({ 'id': user_id }})
    return user_data


#@app.route('/post/<:post>', methods=["GET"])
@socketio.on('get_post')
def get_post(json):
    post_id = json.post_id
    post_data = posts.find_one({ 'id': post_id }})
    return post_data


#@app.route('/block/<:block>', methods=["GET"])
@socketio.on('get_block')
def get_block(json):
    block_id = json.block_id
    block_data = blocks.find_one({ 'id': block_id }})
    return block_data


def get_user_obj(user_id):
    user_data = get_user(user_id)
    user_obj = User(**user_data)
    return user_obj


def get_post_obj(post_id):
    post_data = get_post(post_id)
    post_obj = Post(**post_data)
    return post_obj


def get_block_obj(block_id):
    block_data = get_block(block_id)
    block_obj = Block(**block_data)
    return block_obj


#@app.route('/user/<:user>/post/save', methods=["POST"])
@socketio.on('save_post')
def save_post(json):
    post_id = json.post
    user_obj = get_user_obj(user_id)
    user_obj.library["posts"].append(post_id)
    user_data = user_obj.__dict__
    users.insert_one(user_data)


#@app.route('/user/<:user>/block/save', methods=["POST"])
@socketio.on('save_block')
def save_block(json):
    block_id = json.block
    user_obj = get_user_obj(user_id)
    user_obj.library["blocks"].append(block_id)
    user_data = user_obj.__dict__
    users.insert_one(user_data)


#@app.route('/posts/<:post>/tag/create', methods=["POST"])
@socketio.on('post_add_tag')
def post_add_tag(json): 
    post_id = json.post_id
    tag = json.tag
    post_obj = get_post_obj(post_id)
    post_obj.tags.append(tag)
    post_data = post_obj.__dict__
    posts.insert_one(post_data)


#@app.route('/blocks/<:block>/tag/create', methods=["PUT"])
@socketio.on('post_add_tag')
def block_add_tag(json): 
    block_id = json.block_id
    tag = json.tag
    block_obj = get_block_obj(block_id)
    block_obj.tags.append(tag)
    block_data = block_obj.__dict__
    blocks.insert_one(block_data)


#@app.route('/user/<:user>', methods=["POST"])
@socketio.on('create_user')
def create_user(json):
    ip = json.ip
    user_obj = User(ip)
    user_data = user_obj.__dict__
    users.insert_one(user_data)


#@app.route('/user/<:user>/post/create', methods=["POST"])
@socketio.on('create_post')
def create_post(json):
    user_id = json.user_id
    user_obj = get_user_obj(user_id)

    post_obj = Post(user_obj)

    blocks = json.blocks
    # TODO more processing needed?
    block_ids = []
    for b in blocks:
        block_obj = Block(user_obj, post_obj, b) # TODO b 
        blocks_ids.append(block_obj.id)
        block_data = blocks_obj.__dict__
        blocks.insert_one(block_data)

    post_obj.blocks = blocks_ids
    post_data = post_objs.__dict__

    user_obj.history.append(post_obj.id)
    user_data = user_obj.__dict__
    users.insert_one(user_data)

    posts.insert_one(post_data)
    return jsonify(**post_data)


if __name__ == '__main__':
    app.run()
