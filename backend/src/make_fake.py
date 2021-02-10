"""
Create a fake discussion with a user to begin frontend development.
"""
from managers.global_manager import GlobalManager
from utils import utils

gm = GlobalManager()
gm.start()

board = gm.board_manager.create()
board_id = board["board_id"]

print("made board id {}".format(board_id))
