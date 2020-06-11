# Imagine that:
# 1) We are creating a dataframe of blocks, block_df, that is being updated
#      as block entries are added.
#    The generic block_df has the fields block_id, post_id, freq_dict.
#    Because requests may be frequent, the update before the search
#      will not capture all new updates.  Therefore, the search may not be 
#      perfect.  This is alright, because the human is unlikely to perceive a 
#      difference.  If they want to search on a just-made post, they can 
#      perform the search again.
# 2) Block entries have a field called word_freq which maps each word
#      present in the text to the frequency.  The words are stemmed first
#      so that words with the same root are considered the same. The dict used
#      is a "defaultdict" which provides a default value when a key is not in
#      the dict.  The default value is 0.
#    
#    from collections import defaultdict
#    defaultdict(lambda:0, original_dict)
#

import math
import pandas as pd
from nltk import pos_tag
from nltk.stem import PorterStemmer
from threading import Lock


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
        word_freq = {w:row["freq:" + w] for w in key_word_list}
        word_score = [weights[w] * math.log(f + 1) for w,f in word_freq]
        return sum(word_score)

    return metric


def update_block_df():
    block_ids = [update_dict.keys()]

    if len(block_ids):
        post_ids = [v["post_id"] for i,v in update_dict]
        freq_dicts = [v["freq_dict"] for i,v in update_dict]

        info = {
                "block_id":block_ids,
                "post_id":post_ids,
                "freq_dict":freq_dicts
        }

        # refresh (should not need lock)
        for i in block_ids:
            del update_dict[i]

        # update (does require lock)
        with block_df_lock:
            block_df = block_df.append(info, ignore_index=True)


def basic_search(key_word_list):
    update_block_df()

    metric = make_metric(key_word_list) 
    search_df = block_df.copy()

    # block search
    for w in key_word_list:
        search_df["freq:" + w] = search_df["freq_dict"][w] 
    search_df["block_score"] = search_df.apply(metric, axis = 1)
    search_df = search_df.sort_values("block_score", ascending=False)
    search_df = search_df[search_df["block_score"] > 0]
    search_block_df = block_df.copy() # save for output

    # post search
    sum_funcs = search_df.fromkeys(
        tuple(["freq:" + w for w in key_word_list]), ['sum']
    )
    search_df = search_df.groupby("post_id").agg(sum_funcs)
    search_df["post_score"] = search_df.apply(metric, axis = 1)
    search_df = search_df.sort_values("post_score", ascending=False)
    search_df = search_df[search_df["post_score"] > 0]
    search_post_df = search_df

    return search_block_df, search_post_df
