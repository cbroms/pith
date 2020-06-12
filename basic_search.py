from functools import reduce
import math
import nltk
from nltk import pos_tag
from nltk.stem import PorterStemmer
from operator import or_
import pandas as pd
from threading import Lock


nltk.download('averaged_perceptron_tagger')
ps = PorterStemmer()
block_df_lock = Lock()


# very rudimentary and misses things like pronouns and adverbs
def assign_pos_weight(cat):
    if "JJ" in cat: # adjective
        return 1
    elif "NN" in cat: # noun
        return 1
    elif "VB" in cat: # verb
        return 1
    else:
        return 0


def make_metric(key_word_list):
    stemmed = [ps.stem(w) for w in key_word_list]
    pos = pos_tag(key_word_list)
    weights = {w:assign_pos_weight(c) for w,c in pos}

    def metric(row):
        score = 0
        fd = row["freq_dict"]
        word_freq = {w:fd[w] for w in key_word_list if w in fd}
        word_score = [weights[w] * math.log(f + 1) for w,f in word_freq.items()]
        return sum(word_score)

    return metric


def update_block_df(block_df, update_dict): # TODO should be state change
    block_ids = list(update_dict.keys())

    if len(block_ids):
        info = [{"block_id": i, **v} for i, v in update_dict.items()]

        # refresh (should not need lock)
        for i in block_ids:
            del update_dict[i]

        # update (does require lock)
        with block_df_lock:
            block_df = block_df.append(info, ignore_index=True)

    return block_df, update_dict


def sum_dicts(dL):
  keys = reduce(or_, [set(d) for d in dL])
  return {k:sum([d.get(k,0) for d in dL]) for k in keys}


# TODO should use state info
def basic_search(key_word_list, block_df, update_dict):
    block_df, update_dict = update_block_df(block_df, update_dict)

    metric = make_metric(key_word_list)
    search_block_df = block_df.copy()

    # block search
    search_block_df["block_score"] = search_block_df.apply(metric, axis = 1)
    search_block_df = search_block_df.sort_values("block_score", ascending=False)
    search_block_df = search_block_df[search_block_df["block_score"] > 0]

    # post search
    post_groups = search_block_df.groupby("post_id", as_index=False)
    post_list = []
    for name, group in post_groups:
      post_list.append(
          {
              "post_id": name, 
              "freq_dict": sum_dicts(group["freq_dict"])
          }
      )
    search_post_df = pd.DataFrame(post_list)
    search_post_df["post_score"] = search_post_df.apply(metric, axis = 1)
    search_post_df = search_post_df.sort_values("post_score", ascending=False)
    search_post_df = search_post_df[search_post_df["post_score"] > 0]

    return search_block_df, search_post_df
