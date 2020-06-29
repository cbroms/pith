# TODO figure out at what point we are handling json data and when we
# are using abstract objects
"""
Peruse following for more efficient updates:
- https://stackoverflow.com/questions/4372797/how-do-i-update-a-mongo-document-after-inserting-it
- https://stackoverflow.com/questions/33189258/append-item-to-mongodb-document-array-in-pymongo-without-re-insertion

If things go wonky, try:
sudo rm /var/lib/mongodb/mongod.lock
sudo service mongodb start
"""

from collections import defaultdict
from flask import Flask
from flask_socketio import SocketIO, emit
from json import dumps, JSONEncoder
from pymongo import MongoClient 
from uuid import UUID

from models.user_manager import UserManager
from models.discussion_manager import DiscussionManager

from utils import utils


# TODO move somewhere else
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

client = MongoClient('mongodb://localhost:27017')
try:
    client.drop_database("db")
except Exception:
db = client["db"]

user_manager = UserManager(db)
discussion_manager = DiscussionManager(db)
#########################


class UUIDEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return obj.hex
        return JSONEncoder.default(self, obj)


@socketio.on('get_discussions')
def get_discussions():
    discussions_data = discussion_manager.get_discussions()
    return dumps(discussions_data, cls=UUIDEncoder)


@socketio.on('get_discussion')
def get_discussion(json):
    discussion_id = json["discussion_id"]
    discussion_data = discussion_manager.get_discussion(discussion_id)
    return dumps(discussion_data, cls=UUIDEncoder)


@socketio.on('get_discussion_users')
def get_discussion_users(json):
    discussion_id = json["discussion_id"]
    discussion = discussion_manager.get_discussion(discussion_id)
    return dumps(discussion.get_discussion_users(), cls=UUIDEncoder)


@socketio.on('get_discussion_posts')
def get_discussion_posts(json):
    discussion_id = json["discussion_id"]
    discussion_data = discussion_manager.get_discussion(discussion_id)
    posts_data = discussion.get_discussion_posts() # WRONG
    return dumps(posts_data, cls=UUIDEncoder)


# get a specific user with ID (IP address in base64)
@socketio.on('get_user')
def get_user(json):
    user_id = json["user_id"]
    user_data = user_manager.get_user(user_id) 
    return dumps(user_data, cls=UUIDEncoder)


# check if a user exists, then add a new one if not
@socketio.on('create_user')
def create_user(json):
    ip = json["user_id"]
    user_data = user_manager.create_user(ip)
    return dumps(user_data, cls=UUIDEncoder)


# TODO MODIFY to get via discussion object
@socketio.on('get_post')
def get_post(json):
    post_id = json["post_id"]
    post_data = database.get_post(post_id) 
    return dumps(post_data, cls=UUIDEncoder)


# TODO MODIFY to get via discussion object
@socketio.on('get_block')
def get_block(json):
    block_id = json["block_id"]
    user_id = json["user_id"]
    block_data = database.get_block(block_id)
    return dumps(block_data, cls=UUIDEncoder)


# TODO this is separate from the list of discussions a user is IN
# TODO MODIFY to get via user object
@socketio.on('save_discussion')
def save_discussion(json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    discussion_data = other.save_discussion(discussion_id, user_id)
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("discussion_saved", serialized) # TODO remove, combine above and below
    return serialized
# TODO corresponding unsave discussion


# TODO MODIFY to get via user object and with discussion id
@socketio.on('save_post')
def save_post(json):
    post_id = json["post_id"]
    user_id = json["user_id"]
    post_data = other.save_post(post_id, user_id)
    serialized = dumps(post_data, cls=UUIDEncoder)
    emit("post_saved", serialized) # TODO remove, combine above and below 
    return serialized
# TODO corresponding unsave discussion


# TODO MODIFY to get via user object and with discussion id
@socketio.on('save_block')
def save_block(json):
    block_id = json["block_id"]
    user_id = json["user_id"]
    database.save_block(block_id, user_id)
    block_data = database.get_block(block_id)
    serialized = dumps(block_data, cls=UUIDEncoder)
    emit("updated_block", serialized) # TODO remove, combine above and below
    return serialized

# TODO MODIFY to get via user object and with discussion id
@socketio.on('unsave_block')
def unsave_block(json):
    block_id = json["block_id"]
    user_id = json["user_id"]
    database.unsave_block(block_id, user_id)
    serialized = dumps(block_data, cls=UUIDEncoder)
    emit("updated_block", serialized) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via user object
@socketio.on('get_saved_discussions')
def get_saved_discussions(json):
    user_id = json["user_id"]
    discussions = database.get_user_saved_discussions(user_id)
    return dumps(discussions, cls=UUIDEncoder)


# TODO MODIFY to get via user object and with discussion id
@socketio.on('get_saved_posts')
def get_saved_posts(json):
    user_id = json["user_id"]
    posts_data = database.get_user_saved_posts(user_id)
    return dumps(posts_data, cls=UUIDEncoder)


# TODO MODIFY to get via user object and with discussion id
@socketio.on('get_saved_blocks')
def get_saved_blocks(json):
    user_id = json["user_id"]
    blocks_data = database.get_user_saved_blocks(user_id)
    return dumps(blocks_data, cls=UUIDEncoder)


# TODO MODIFY to get via discussion object
@socketio.on('discussion_add_tag')
def discussion_add_tag(json): 
    discussion_id = json["discussion_id"]
    tag = json["tag"]
    discussion_data = discussions_add_tag(discussion_id, tag)    
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("discussion_add_tag", serialized) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via user object and with discussion id
@socketio.on('post_add_tag')
def post_add_tag(json): 
    post_id = json["post_id"]
    tag = json["tag"] 
    post_data = other.post_add_tag(post_id, tag)
    serialized = dumps(post_data, cls=UUIDEncoder)
    emit("post_add_tag", serialized) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via user object and with discussion id
@socketio.on('block_add_tag')
def block_add_tag(json): 
    block_id = json["block_id"]
    tag = json["tag"]
    block_data = block_add_tag(block_id, tag)
    serialized = dumps(block_data, cls=UUIDEncoder)
    emit("updated_block", serialized, broadcast=True) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via discussion object
@socketio.on('discussion_remove_tag')
def discussion_remove_tag(json): 
    discussion_id = json["discussion_id"]
    tag = json["tag"]
    discussion_data = other.discussion_remove_tag(discussion_id, tag)
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("discussion_remove_tag", serialized) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via user object and with discussion id
@socketio.on('post_remove_tag')
def post_remove_tag(json): 
    post_id = json["post_id"]
    tag = json["tag"]
    post_data = other.post_remove_tag(post_id, tag)
    serialized = dumps(post_data, cls=UUIDEncoder)
    emit("updated_post", serialized) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via user object and with discussion id
@socketio.on('block_remove_tag')
def block_remove_tag(json): 
    block_id = json["block_id"]
    tag = json["tag"]
    block_data = other.block_remove_tag(block_id, tag)
    serialized = dumps(block_data, cls=UUIDEncoder)
    emit("updated_block", serialized, broadcast=True) # TODO remove, combine above and below
    return serialized


@socketio.on('create_discussion')
def create_discussion(json):
    discussion_data = discussion_manager.create_discussion()
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("discussion_created", serialized, broadcast=True) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via discussion object
@socketio.on('join_discussion')
def join_discussion(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    discussion_data = other.join_discussion(discussion_id, user_id)
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("join_discussion", serialized, broadcast=True) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via discussion object
@socketio.on('leave_discussion')
def leave_discussion(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    discussion_data = other.leave_discussion(discussion_id, user_id)
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("leave_discussion", serialized, broadcast=True) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via discussion object
@socketio.on('create_post')
def create_post(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    post_data = other.create_post(discussion_id, user_id)
    serialized = dumps(post_data, cls=UUIDEncoder)
    emit("post_created", serialized, broadcast=True) # TODO remove, combine above and below
    return serialized


# TODO MODIFY to get via discussion object
@socketio.on('search_discussion')
def search_discussion(json):
    query = json["query"]
    discussion_id = json["discussion_id"]
    result = discussion_scope_search(query, discussion_id)
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


# TODO MODIFY to get via user object
@socketio.on('search_user_saved')
def search_user_saved(json):
    query = json["query"]
    user_id = json["user_id"]
    result = user_saved_scope_search(query, user_id)
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


if __name__ == '__main__':
    app.run()
