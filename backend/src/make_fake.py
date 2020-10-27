"""
Create a fake discussion with a user to begin frontend development.
"""
from managers.global_manager import GlobalManager
from models.discussion import (
  Discussion,
	Unit
)

gm = GlobalManager()
gm.start()

Discussion.objects().delete()
Unit.objects().delete()

discussion_id = gm.board_manager.create()["discussion_id"]
nickname = "whales"
user_id = gm.discussion_manager.create_user(
  discussion_id=discussion_id, nickname=nickname)["user_id"]
print("discussion_id", discussion_id)
print("user_id", discussion_id)
