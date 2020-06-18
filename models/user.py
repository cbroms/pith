class User():
    def __init__(self, _id, **entries):
        if "_id" in entries:
            self._id = entries["_id"]
        else:
            self._id = _id
        if "library" in entries:
            self.library = entries["library"]
        else:
            self.library = {}
            self.library["discussions"] = [] # saved discussions
            self.library["posts"] = [] # saved posts
            self.library["blocks"] = [] # saved blocks
        if "history" in entries:
            self.history = entries["history"]
        else:
            self.history = [] # list of posts
        if "discussions" in entries:
            self.discussions = entries["discussions"]
        else:
            self.discussions = [] # list of discussions user is in
