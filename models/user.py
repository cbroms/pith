class User():
    def __init__(self, _id, **entries):
        self._id = _id
        if "library" in entries:
            self.library = entries["library"]
        else:
            self.library = {}
            self.library["posts"] = [] # saved posts
            self.library["blocks"] = [] # saved blocks
        if "history" in entries:
            self.history = entries["history"]
        else:
            self.history = [] # list of posts
