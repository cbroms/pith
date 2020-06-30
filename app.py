"""
Peruse following for more efficient updates:
- https://stackoverflow.com/questions/4372797/how-do-i-update-a-mongo-document-after-inserting-it
- https://stackoverflow.com/questions/33189258/append-item-to-mongodb-document-array-in-pymongo-without-re-insertion

If things go wonky, try:
sudo rm /var/lib/mongodb/mongod.lock
sudo service mongodb start
"""
from constants import (
    app,
    discussion_manager,
    socketio,
    user_manager,
)
from utils.utils import UUIDEncoder


@socketio.on('get_discussions')
def get_discussions():
    discussions_data = discussion_manager.get_all()
    return dumps(discussions_data, cls=UUIDEncoder)


@socketio.on('get_posts')
def get_posts(json):
    discussion_id = json["discussion_id"]
    posts_data = discussion_manager.get_posts(discussion_id)
    return dumps(posts_data, cls=UUIDEncoder)


@socketio.on('create_user')
def create_user(json):
    ip = json["user_id"]
    user_data = user_manager.create(ip)
    return dumps(user_data, cls=UUIDEncoder)


@socketio.on('get_block')
def get_block(json):
    discussion_id = json["discussion_id"]
    block_id = json["block_id"]
    block_data = discussion_manager.get_block(discussion_id, block_id)
    return dumps(block_data, cls=UUIDEncoder)


@socketio.on('save_post')
def save_post(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    post_id = json["post_id"]
    post_data = user_manager.save_post(user_id, discussion_id, post_id)
    serialized = dumps(post_data, cls=UUIDEncoder)
    emit("saved_post", serialized) 
    return serialized


@socketio.on('unsave_post')
def unsave_post(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    post_id = json["post_id"]
    post_data = user_manager.unsave_post(user_id, discussion_id, post_id)
    serialized = dumps(post_data, cls=UUIDEncoder)
    emit("unsaved_post", serialized) 
    return serialized


@socketio.on('save_block')
def save_block(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    block_id = json["block_id"]
    block_data = user_manager.save_block(user_id, discussion_id, block_id)
    serialized = dumps(block_data, cls=UUIDEncoder)
    emit("saved_block", serialized) 
    return serialized


@socketio.on('unsave_block')
def unsave_block(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    block_id = json["block_id"]
    block_data = user_manager.unsave_block(user_id, discussion_id, block_id)
    serialized = dumps(block_data, cls=UUIDEncoder)
    emit("unsaved_block", serialized) 
    return serialized


@socketio.on('get_saved_posts')
def get_saved_posts(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    posts_data = user_manager.get_user_saved_posts(user_id, discussion_id)
    return dumps(posts_data, cls=UUIDEncoder)


@socketio.on('get_saved_blocks')
def get_saved_blocks(json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    blocks_data = user_manager.get_user_saved_blocks(user_id, discussion_id)
    return dumps(blocks_data, cls=UUIDEncoder)


@socketio.on('post_add_tag')
def post_add_tag(json): 
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    post_id = json["post_id"]
    tag = json["tag"] 
    discussion_manager.post_add_tag(discussion_id, user_id, post_id, tag)
    serialized = dumps({"post_id": post_id, "user_id": user_id, "tag": tag}, \
        cls=UUIDEncoder, broadcast=True)
    emit("tagged_post", serialized)
    return serialized


@socketio.on('post_remove_tag')
def post_remove_tag(json): 
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    post_id = json["post_id"]
    tag = json["tag"]
    discussion_manager.post_remove_tag(discussion_id, user_id, post_id, tag)
    serialized = dumps({"post_id": post_id, "tag": tag}, \
        cls=UUIDEncoder, broadcast=True)
    emit("untagged_post", serialized)
    return serialized


@socketio.on('block_add_tag')
def block_add_tag(json): 
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    block_id = json["block_id"]
    tag = json["tag"] 
    discussion_manager.block_add_tag(discussion_id, user_id, block_id, tag)
    serialized = dumps({"block_id": block_id, "user_id": user_id, "tag": tag}, \
        cls=UUIDEncoder)
    emit("tagged_block", serialized, broadcast=True)
    return serialized


@socketio.on('block_remove_tag')
def block_remove_tag(json): 
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    block_id = json["block_id"]
    tag = json["tag"]
    discussion_manager.block_remove_tag(discussion_id, user_id, block_id, tag)
    serialized = dumps({"block_id": block_id, "tag": tag}, \
        cls=UUIDEncoder)
    emit("untagged_block", serialized, broadcast=True)
    return serialized


@socketio.on('create_discussion')
def create_discussion(json):
    discussion_data = discussion_manager.create()
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("created_discussion", serialized, broadcast=True)
    return serialized


@socketio.on('join_discussion')
def join_discussion(json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    discussion_data = discussion_manager.join(discussion_id, user_id)
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("joined_discussion", serialized, broadcast=True)
    return serialized


@socketio.on('leave_discussion')
def leave_discussion(json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    discussion_data = discussion_manager.leave(discussion_id, user_id)
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    emit("left_discussion", serialized, broadcast=True)
    return serialized


@socketio.on('create_post')
def create_post(json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    blocks = json["blocks"]
    post_data = discussion_manager.create_post(discussion_id, user_id, blocks)
    serialized = dumps(post_data, cls=UUIDEncoder)
    emit("created_post", serialized, broadcast=True)
    return serialized


@socketio.on('search_discussion')
def search_discussion(json):
    discussion_id = json["discussion_id"]
    query = json["query"]
    result = discussion_manager.discussion_scope_search(discussion_id, query)
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


@socketio.on('search_user_saved')
def search_user_saved(json):
    user_id = json["user_id"]
    query = json["query"]
    result = user_manager.user_saved_scope_search(user_id, query)
    serialized = dumps(result, cls=UUIDEncoder)
    return serialized


if __name__ == '__main__':
    app.run()
