from collections import Counter, defaultdict
import datetime
from functools import reduce
from json import JSONEncoder, dumps
from mongoengine import (
  Document,
  EmbeddedDocument,
)
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
from uuid import UUID, uuid4

def get_time():
  datetime.utcnow()

def gen_key():
	return uuid4().hex[:12] # hack

class DictEncoder(JSONEncoder):
    def default(self, obj):
        #if isinstance(obj, UUID):
        #    return obj.hex
        #if isinstance(obj, (datetime.date, datetime.datetime)):
        #    return obj.strftime(constants.DATE_TIME_FMT)
        #if isinstance(obj, (Document, EmbeddedDocument)):
        #    return obj.to_mongo() # dict
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
  if src is None:
    return False
  return isinstance(src, Errors) 

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
