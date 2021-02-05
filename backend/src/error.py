import enum


class Errors(enum.Enum):

	SERVER_ERR = -1
	"""
	Internal server error.
	"""

	BAD_REQUEST = -2
	"""
	Malformed JSON request.
	"""

	DNE_BOARD = -3
	"""
	Given board ID does not exist.
	"""

	DNE_DISC = -4
	"""
	Given discussion ID does not exist.
	"""

	DNE_UNIT = -5
	"""
	Given unit ID does not exist.
	"""

	DNE_LINK = -6
	"""
	Given link ID does not exist.
	"""

	DNE_USER = -7
	"""
	Given user ID does not exist.
	"""

	EXISTS_NAME = -8
	"""
	Given nickname for user already is in use in discussion.
	"""

	NOT_CHAT = -9
	"""
	Given unit is not a chat unit.
	"""

	NOT_BOARD = -10
	"""
	Given unit is not a board unit.
	"""
