"""
Peruse following for more efficient updates:
- https://stackoverflow.com/questions/4372797/how-do-i-update-a-mongo-document-after-inserting-it
- https://stackoverflow.com/questions/33189258/append-item-to-mongodb-document-array-in-pymongo-without-re-insertion

If things go wonky, try:
sudo rm /var/lib/mongodb/mongod.lock
sudo service mongodb start
"""
from json import dumps
import socketio
from uuid import UUID

from models.global_manager import global_manager
from utils.utils import UUIDEncoder


gm = GlobalManager()
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[
        "http://localhost:3000",
        "https://dev1.pith.rainflame.com"
    ]
)
app = socketio.ASGIApp(sio)

"""
Possible JSON Outputs
NOTE: not the same as Python classes

Discussion
{
    "_id" : discussion_id<str>,
    "users" : {user_id<str> : {"name" : name<str>}, ...},
    "history": {post_id<str> : post_data<Post>}},
    "history_blocks": {block_id<str> : block_data<Block>},
    "internal_tags": {tag<str> : tag_data<Tag>, ...}
}

User
{
    "_id" : user_id<str>,
    "discussions" : {
        "active" : is_active<bool>,
        "name" : name<str>,
        "history" : [post_id1<str>, post_id2<str>, ...],
        "library" : {
            "posts" : {post_id1<str> : None, post_id2<str> : None, ...}
            "blocks" : {block_id1<str> : None, block_id2<str> : None, ...} 
        }
    }
}

Post
{
    "_id" : post_id<str>,
    "user" : user_id<str>,
    "blocks" : [block_id1<str>, block_id2<str>, ...],
    "tags" : {tag<str> : {"owner" : user_id<str>}},
    "created_at" : time_stamp<str>
}
Block
{
    "_id" : block_id<str>,
    "user" : user_id<str>,
    "post" : post_id<str>,
    "body" : block_msg<str>,
    "tags" : {tag<str> : {"owner" : user_id<str>}},
    "created_at" : time_stamp<str>
}

"""


"""
Input: None
Output: discussion_data<Discussion>
"""
@sio.on('get_discussions')
async def get_discussions(sid):
    discussions_data = gm.discussion_manager.get_all()
    return dumps(discussions_data, cls=UUIDEncoder)


"""
Input: discussion_id<str>
Output: discussion_data<Discussion>
"""
@sio.on('get_discussion')
async def get_discussion(sid, json):
    discussion_id = json["discussion_id"]
    discussion_data = gm.discussion_manager.get(discussion_id)
    return dumps(discussion_data, cls=UUIDEncoder)

"""
Input: discussion_id<str>
Output: names : [name1<str>, name2<str>, ...]
"""
@sio.on('get_discussion_names')
async def get_discussion_names(sid, json):
    discussion_id = json["discussion_id"]
    names = gm.discussion_manager.get_names(discussion_id)
    return dumps(names, cls=UUIDEncoder)

"""
Input: discussion_id<str>
Output: posts_data : [post_data1<Post>, post_data2<Post>, ...] 
"""
@sio.on('get_posts')
async def get_posts(sid, json):
    discussion_id = json["discussion_id"]
    posts_data = gm.discussion_manager.get_posts(discussion_id)
    return dumps(posts_data, cls=UUIDEncoder)


"""
Input: user_id<str>
Output: user_data<User>
"""
@sio.on('create_user')
async def create_user(sid, json):
    ip = json["user_id"]
    user_data = gm.user_manager.create(ip)
    return dumps(user_data, cls=UUIDEncoder)


"""
Input: discussion_id<str>, block_id<str>
Output: block_data<Block>
"""
@sio.on('get_block')
async def get_block(sid, json):
    discussion_id = json["discussion_id"]
    block_id = json["block_id"]
    block_data = gm.discussion_manager.get_block(discussion_id, block_id)
    return dumps(block_data, cls=UUIDEncoder)


"""
Input: user_id<str>, discussion_id<str>, block_id<str>
Output: {"post_id" : post_id<str>}
"""
@sio.on('save_post')
async def save_post(sid, json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    post_id = json["post_id"]
    gm.user_manager.save_post(user_id, discussion_id, post_id)
    serialized = dumps({"post_id": post_id}, cls=UUIDEncoder)
    await sio.emit("saved_post", serialized, to=sid) 
    return serialized


"""
Input: user_id<str>, discussion_id<str>, block_id<str>
Output: {"post_id" : post_id<str>}
"""
@sio.on('unsave_post')
async def unsave_post(sid, json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    post_id = json["post_id"]
    gm.user_manager.unsave_post(user_id, discussion_id, post_id)
    serialized = dumps({"post_id": post_id}, cls=UUIDEncoder)
    await sio.emit("unsaved_post", serialized, to=sid) 
    return serialized


"""
Input: user_id<str>, discussion_id<str>, block_id<str>
Output: {"block_id" : block_id<str>}
"""
@sio.on('save_block')
async def save_block(sid, json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    block_id = json["block_id"]
    gm.user_manager.save_block(user_id, discussion_id, block_id)
    serialized = dumps({"block_id": block_id}, cls=UUIDEncoder)
    await sio.emit("saved_block", serialized, to=sid) 
    return serialized


"""
Input: user_id<str>, discussion_id<str>, block_id<str>
Output: {"block_id" : block_id<str>}
"""
@sio.on('unsave_block')
async def unsave_block(sid, json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    block_id = json["block_id"]
    gm.user_manager.unsave_block(user_id, discussion_id, block_id)
    serialized = dumps({"block_id": block_id}, cls=UUIDEncoder)
    await sio.emit("unsaved_block", serialized, to=sid)
    return serialized


"""
Input: user_id<str>, discussion_id<str>
Output: post_ids: [post_id1<str>, post_id2<str>, ...]
"""
@sio.on('get_saved_posts')
async def get_saved_posts(sid, json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    post_ids = gm.user_manager.get_user_saved_posts(user_id, discussion_id)
    return dumps(post_ids, cls=UUIDEncoder)


"""
Input: user_id<str>, discussion_id<str>
Output: block_ids: [block_id1<str>, block_id2<str>, ...]
"""
@sio.on('get_saved_blocks')
async def get_saved_blocks(sid, json):
    user_id = json["user_id"]
    discussion_id = json["discussion_id"]
    blocks_data = gm.user_manager.get_user_saved_blocks(user_id, discussion_id)
    return dumps(blocks_data, cls=UUIDEncoder)


"""
Input: discussion_id<str>, user_id<str>, post_id<str>, tag<str> 
Output: {"post_id" : post_id<str>, "user_id" : user_id<str>, "tag" : tag<str>}
"""
@sio.on('post_add_tag')
async def post_add_tag(sid, json): 
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    post_id = json["post_id"]
    tag = json["tag"] 
    gm.discussion_manager.post_add_tag(discussion_id, user_id, post_id, tag)
    serialized = dumps({"post_id": post_id, "user_id": user_id, "tag": tag}, \
        cls=UUIDEncoder, broadcast=True)
    await sio.emit("tagged_post", serialized, room=discussion_id)
    return serialized


"""
Input: discussion_id<str>, user_id<str>, post_id<str>, tag<str> 
Output: {"post_id" : post_id<str>, "tag" : tag<str>}
"""
@sio.on('post_remove_tag')
async def post_remove_tag(sid, json): 
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    post_id = json["post_id"]
    tag = json["tag"]
    gm.discussion_manager.post_remove_tag(discussion_id, user_id, post_id, tag)
    serialized = dumps({"post_id": post_id, "tag": tag}, \
        cls=UUIDEncoder, broadcast=True)
    await sio.emit("untagged_post", serialized, room=discussion_id)
    return serialized


"""
Input: discussion_id<str>, user_id<str>, block_id<str>, tag<str> 
Output: {"block_id" : block_id<str>, "user_id" : user_id<str>, "tag" : tag<str>}
"""
@sio.on('block_add_tag')
async def block_add_tag(sid, json): 
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    block_id = json["block_id"]
    tag = json["tag"] 
    gm.discussion_manager.block_add_tag(discussion_id, user_id, block_id, tag)
    serialized = dumps({"block_id": block_id, "user_id": user_id, "tag": tag}, \
        cls=UUIDEncoder)
    await sio.emit("tagged_block", serialized, room=discussion_id)
    return serialized


"""
Input: discussion_id<str>, user_id<str>, block_id<str>, tag<str> 
Output: {"block_id" : block_id<str>, "tag" : tag<str>}
"""
@sio.on('block_remove_tag')
async def block_remove_tag(sid, json): 
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    block_id = json["block_id"]
    tag = json["tag"]
    gm.discussion_manager.block_remove_tag(discussion_id, user_id, block_id, tag)
    serialized = dumps({"block_id": block_id, "tag": tag}, \
        cls=UUIDEncoder)
    await sio.emit("untagged_block", serialized, room=discussion_id)
    return serialized


"""
Input: None 
Output: Discussion 
"""
@sio.on('create_discussion')
async def create_discussion(sid, json):
    discussion_data = gm.discussion_manager.create()
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    await sio.emit("created_discussion", serialized)
    return serialized


"""
Input: discussion_id<str>, user_id<str>, name<str>
Output: discussion_data<Discussion> 
"""
@sio.on('join_discussion')
async def join_discussion(sid, json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    name = json["name"]
    discussion_data = gm.discussion_manager.join(discussion_id, user_id, name)
    discussion_id = discussion_data["_id"]
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    sio.enter_room(sid, discussion_id)
    await sio.emit("joined_discussion", serialized, room=discussion_id)
    return serialized


"""
Input: discussion_id<str>, user_id<str>
Output: discussion_data<Discussion> 
"""
@sio.on('leave_discussion')
async def leave_discussion(sid, json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    discussion_data = gm.discussion_manager.leave(discussion_id, user_id)
    discussion_id = discussion_data["_id"]
    serialized = dumps(discussion_data, cls=UUIDEncoder)
    sio.leave_room(sid, discussion_id)
    await sio.emit("left_discussion", serialized, room=discussion_id)
    return serialized


"""
Input: discussion_id<str>, user_id<str>, blocks: [block_msg1<str>, block_msg2<str>, ...]
Output: post_data<Post> 
"""
@sio.on('create_post')
async def create_post(sid, json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    blocks = json["blocks"]
    post_data = gm.discussion_manager.create_post(discussion_id, user_id, blocks)
    serialized = dumps(post_data, cls=UUIDEncoder)
    await sio.emit("created_post", serialized, room=discussion_id)
    return serialized


"""
Input: discussion_id<str>, query<str> 
Output: result: {
    "posts" : [post_id1<str>, post_id2<str>, ...], 
    "blocks" : [block_id1<str>, block_id2<str>, ...] 
} 
"""
@sio.on('search_discussion')
async def search_discussion(sid, json):
    discussion_id = json["discussion_id"]
    query = json["query"]
    result = gm.discussion_manager.discussion_scope_search(discussion_id, query)
    serialized = dumps(result, cls=UUIDEncoder, to=sid)
    return serialized


"""
Input: discussion_id<str>, tags: [tag1<str>, tag2<str>, ...] 
Output: result: {
    "posts" : [post_id1<str>, post_id2<str>, ...], 
    "blocks" : [block_id1<str>, block_id2<str>, ...] 
} 
"""
@sio.on('search_discussion_tags')
async def search_discussion_tags(sid, json):
    discussion_id = json["discussion_id"]
    tags = json["tags"]
    result = gm.discussion_manager.discussion_tag_search(discussion_id, tags)
    serialized = dumps(result, cls=UUIDEncoder, to=sid)
    return serialized


"""
Input: discussion_id<str>, user_id<str>, query<str> 
Output: result: {
    "posts" : [post_id1<str>, post_id2<str>, ...], 
    "blocks" : [block_id1<str>, block_id2<str>, ...] 
} 
"""
@sio.on('search_user_saved')
async def search_user_saved(sid, json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    query = json["query"]
    result = gm.discussion_manager.user_saved_scope_search(discussion_id, user_id, query)
    serialized = dumps(result, cls=UUIDEncoder, to=sid)
    return serialized


"""
Input: discussion_id<str>, user_id<str>, tags: [tag1<str>, tag2<str>, ...] 
Output: result: {
    "posts" : [post_id1<str>, post_id2<str>, ...], 
    "blocks" : [block_id1<str>, block_id2<str>, ...] 
} 
"""
@sio.on('search_user_saved_tags')
async def search_user_saved_tags(sid, json):
    discussion_id = json["discussion_id"]
    user_id = json["user_id"]
    tags = json["tags"]
    result = gm.discussion_manager.user_saved_tag_search(discussion_id, user_id, tags)
    serialized = dumps(result, cls=UUIDEncoder, to=sid)
    return serialized
