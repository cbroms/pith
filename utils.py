from functools import reduce
from operator import or_


# combine a list of dicts into one dict (includes all keys)
def sum_dicts(dL):
  keys = reduce(or_, [set(d) for d in dL])
  return {k:sum([d.get(k,0) for d in dL]) for k in keys}
