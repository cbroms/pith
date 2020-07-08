"""
User struct.
"""


class User():
    def __init__(self, _id, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = _id
            """
            A dict where keys are discussion ids and values are 
            - active # if in the discussion at the moment
            - name
            - library 
              - posts # saved post ids
              - blocks # saved block ids
            """
            self.discussions = {}
