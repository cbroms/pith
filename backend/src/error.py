import enum


class Errors(enum.Enum):
  BAD_REQUEST = -1
  """
  Malformed JSON request.
  """

  BAD_RESPONSE = -2
  """
  Malformed JSON response.
  """

  BAD_DISCUSSION_ID = -3
  """
  Given discussion ID does not exist.
  """

  BAD_USER_ID = -4
  """
  Given user ID does not exist.
  """

  BAD_UNIT_ID = -5
  """
  Given unit ID does not exist.
  """

  BAD_POSITION = -6
  """
  Given position is invalid index of unit.
  """
  
  BAD_EDIT_TRY = -7
  """
  Cannot perform edit operation as do not have access to lock.
  """

  BAD_POSITION_TRY = -8
  """
  Cannot perform position operation as do not have access to lock.
  """

  BAD_PARENT = -9
  """
  Unit is not valid potential parent of units.
  """

  FAILED_EDIT_ACQUIRE = -10
  """
  Cannot access unit edit lock.
  """

  FAILED_POSITION_ACQUIRE = -11
  """
  Cannot access unit position lock.
  """

  NICKNAME_EXISTS = -12
  """
  Given nickname for user already is in use in discussion.
  """

  USER_ID_EXISTS = -13
  """
  Given ID for user already is in use in discussion.
  """
