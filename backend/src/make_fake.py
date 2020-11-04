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
