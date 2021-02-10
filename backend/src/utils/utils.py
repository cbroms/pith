from collections import Counter, defaultdict
import datetime
from functools import reduce
from json import JSONEncoder, dumps
from nltk.stem import PorterStemmer
from operator import or_
import string
from typing import (
  Any,
  Dict,
  List,
)
import sys
import logging

import constants
from error import Errors
from uuid import uuid4


def absolute_file(schema):
    for key in schema:
        if key == "$ref":
            schema[key] = schema[key].replace("file:", "file:" + path + "/")
        elif isinstance(schema[key], dict):
            schema[key] = absolute(schema[key])
    return schema

def get_room(board_id, discussion_id):
  return "{}:{}".format(board_id, discussion_id)

def get_time():
  return datetime.datetime.utcnow()

def gen_key():
  return uuid4().hex[-12:] # hack

class DictEncoder(JSONEncoder):
  def default(self, obj):
    return JSONEncoder.default(self, obj)

class ErrorEncoder(JSONEncoder):
  def default(self, obj):
    if isinstance(obj, Errors):
      return obj.value
    res = JSONEncoder.default(self, obj)
    return res

# log uncaught exceptions to file in backend/src/{constants.LOG_FILENAME}
logger = logging.getLogger("app_logger")
fh = logging.FileHandler(constants.LOG_FILENAME)
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
fh.setFormatter(formatter)
logger.addHandler(fh)
logger.setLevel(logging.DEBUG)
def exception_handler(type, value, tb):
  logger.exception(str(value))
sys.excepthook = exception_handler

def is_error(src):
  return "error" in src

def make_error(err, error_meta={}):
  exp = {
    "_id": uuid4().hex,
    "error": err,
    "error_meta": error_meta
  }
  logger.exception(exp)
  return dumps(exp, cls=ErrorEncoder)


ps = PorterStemmer()
table = str.maketrans(string.punctuation, ' '*len(string.punctuation))


def text_tokens(text: str) -> List[str]:
  lower_case = text.lower()
  no_punc = lower_case.translate(table)
  word_list = no_punc.split(" ")
  word_list = [w.strip() for w in word_list]
  word_list = [w for w in word_list if w != ""]
  stemmed = [ps.stem(w) for w in word_list]
  return stemmed


def make_freq_dict(text: str) -> Dict[str, int]:
  tokens = text_tokens(text)
  return dict(Counter(tokens))


def sum_dicts(dL: List[Dict[Any, Any]]) -> Dict[Any, Any]:
  keys = reduce(or_, [set(d) for d in dL])
  return defaultdict(lambda:0, {k:sum([d.get(k,0) for d in dL]) for k in keys})
