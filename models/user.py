class User():
    def __init__(self, _id, **entries):
        if "_id" in entries:
            self.__dict__ = entries
        else:
            self._id = _id
            self.library = {}
            self.library["discussions"] = [] # saved discussions
            self.library["posts"] = [] # saved posts
            self.library["blocks"] = [] # saved blocks
            self.history = [] # list of posts
            self.discussions = [] # list of discussions user is in
