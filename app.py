from flask import Flask, jsonify, request
from pymongo import MongoClient
import uuid


app = Flask(__name__)
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


@app.route('/user', methods=["GET"])
def get_users():
    return users.find()


@app.route('/post', methods=["GET"])
def get_posts():
    return posts.find()


@app.route('/block', methods=["GET"])
def get_blocks():
    return blocks.find()


@app.route('/user/<:user>', methods=["GET"])
def get_user(user_id):
    user_data = users.find_one({ 'id': user_id }})
    return user_data


@app.route('/post/<:post>', methods=["GET"])
def get_post(post_id):
    post_data = posts.find_one({ 'id': post_id }})
    return post_data


@app.route('/block/<:block>', methods=["GET"])
def get_block(block_id):
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


@app.route('/user/<:user>/post/save', methods=["POST"])
def save_post():
    post_id = request.post
    user_obj = get_user_obj(user_id)
    user_obj.library["posts"].append(post_id)
    # may need to resave?


@app.route('/user/<:user>/block/save', methods=["POST"])
def save_block():
    block_id = request.block
    user_obj = get_user_obj(user_id)
    user_obj.library["blocks"].append(block_id)
    # may need to resave?


@app.route('/posts/<:post>/tag/create', methods=["POST"])
def post_add_tag(post): 
    post_id = post
    tag = request.tag
    post_obj = get_post_obj(post_id)
    post_obj.tags.append(tag)
    # may need to resave?


@app.route('/blocks/<:block>/tag/create', methods=["PUT"])
def block_add_tag(block): 
    block_id = block
    tag = request.tag
    block_obj = get_block_obj(block_id)
    block_obj.tags.append(tag)
    # may need to resave?


@app.route('/user/<:user>', methods=["POST"])
def create_user():
    # user = ip
    # check not in use


@app.route('/user/<:user>/post/create', methods=["POST"])
def create_post():
    user_id = user
    user_obj = get_user_obj(user_id)

    post_obj = Post(user_obj)

    blocks = request.blocks
    # more stuff needed
    block_ids = []
    for b in blocks:
        block_obj = Block(user_obj, post_obj, b) # TODO check b
        blocks_ids.append(block_obj.id)
        block_data = blocks_objs.__dict__
        blocks.insert_one(block_data)

    post_obj.blocks = blocks_ids
    post_data = post_objs.__dict__

    user_obj.history.append(post_obj.id)
    # may need to resave?

    posts.insert_one(post_data)
    return jsonify(**post_data)


if __name__ == '__main__':
    app.run()
