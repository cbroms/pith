from collections import Counter
from nltk.stem import PorterStemmer
import string
import uuid


ps = PorterStemmer()
table = str.maketrans("", "", string.punctuation)


def make_freq_dict(text):
  lower_case = text.lower()
  no_punc = lower_case.translate(table)
  word_list = no_punc.split(" ")
  stemmed = [ps.stem(w) for w in word_list]
  return dict(Counter(stemmed))


class Block():
    def __init__(self, user, post, body, **entries):
        if "_id" in entries:
            self._id = entries["_id"]
        else:
            self._id = uuid.uuid4().hex
        self.user = user
        self.post = post
        if "tags" in entries:
            self.tags = entries["tags"]
        else:
            self.tags = []
        self.body = body
        self.freq_dict = make_freq_dict(body) 
