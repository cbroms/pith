from collections import Counter, defaultdict
from functools import reduce
from operator import or_
from nltk.stem import PorterStemmer
import string


ps = PorterStemmer()
table = str.maketrans(string.punctuation, ' '*len(string.punctuation))


def text_tokens(text):
  lower_case = text.lower()
  no_punc = lower_case.translate(table)
  word_list = no_punc.split(" ")
  word_list = [w.strip() for w in word_list]
  word_list = [w for w in word_list if w != ""]
  stemmed = [ps.stem(w) for w in word_list]
  return stemmed


def make_freq_dict(text):
  tokens = text_tokens(text)
  return dict(Counter(tokens))


# combine a list of dicts into one dict (includes all keys)
def sum_dicts(dL):
  keys = reduce(or_, [set(d) for d in dL])
  return defaultdict(lambda:0, {k:sum([d.get(k,0) for d in dL]) for k in keys})


class UUIDEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return obj.hex
        return JSONEncoder.default(self, obj)
