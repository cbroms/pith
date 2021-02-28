"""
Create a fake discussion with a user to begin frontend development.
"""
from managers.global_manager import GlobalManager
from utils import utils

gm = GlobalManager()
gm.start()

gm.boards.delete_many({})
gm.discussions.delete_many({})
gm.units.delete_many({})
gm.links.delete_many({})
gm.transclusions.delete_many({})
gm.unit_updates.delete_many({})
gm.users.delete_many({})

board = gm.board_manager.create()
board_id = board["board_id"]

print("made board id {}".format(board_id))
