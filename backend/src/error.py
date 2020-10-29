import enum


class Errors(enum.Enum):
  INVALID_USER_SESSION = -1
  """
  User session is not properly set up.
  """

  BAD_REQUEST = -2
  """
  Malformed JSON request.
  """

  BAD_RESPONSE = -3
  """
  Malformed JSON response.
  """

  BAD_DISCUSSION_ID = -4
  """
  Given discussion ID does not exist.
  """

  BAD_USER_ID = -5
  """
  Given user ID does not exist.
  """

  BAD_UNIT_ID = -6
  """
  Given unit ID does not exist.
  """

  BAD_POSITION = -7
  """
  Given position is invalid index of unit.
  """
  
  BAD_EDIT_TRY = -8
  """
  Cannot perform edit operation as do not have access to lock.
  """

  BAD_POSITION_TRY = -9
  """
  Cannot perform position operation as do not have access to lock.
  """

  BAD_PARENT = -10
  """
  Unit is not valid potential parent of units.
  """

  FAILED_EDIT_ACQUIRE = -11
  """
  Cannot access unit edit lock.
  """

  FAILED_POSITION_ACQUIRE = -12
  """
  Cannot access unit position lock.
  """

  NICKNAME_EXISTS = -13
  """
  Given nickname for user already is in use in discussion.
  """

  USER_ID_EXISTS = -14
  """
  Given ID for user already is in use in discussion.
  """
