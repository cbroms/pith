import math
import nltk
from nltk import pos_tag
from nltk.stem import PorterStemmer
import pandas as pd
from threading import Lock


nltk.download('averaged_perceptron_tagger')
ps = PorterStemmer()
block_df_lock = Lock()
post_df_lock = Lock()
df_lock = {
    "block": block_df_lock,
    "post": post_df_lock
}


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


def update_df(df, update_dict, which): # TODO should be state change
    ids = list(update_dict.keys())

    if len(ids):
        info = [{which + "_id": i, **v} for i, v in update_dict.items()]

        # refresh (should not need lock)
        for i in ids:
            del update_dict[i]

        # update (does require lock)
        with df_lock[which]:
            df = df.append(info, ignore_index=True)

    return df, update_dict


# TODO should use state info
def basic_search(key_word_list, 
        block_df, block_update_dict,
        post_df, post_update_dict):

    block_df, block_update_dict = \
            update_df(block_df, block_update_dict, "block")
    post_df, post_update_dict = \
            update_df(post_df, post_update_dict, "post")

    metric = make_metric(key_word_list)
    search_block_df = block_df.copy()
    search_post_df = post_df.copy()

    # block search
    search_block_df["block_score"] = search_block_df.apply(metric, axis = 1)
    search_block_df = search_block_df.sort_values("block_score", ascending=False)
    search_block_df = search_block_df[search_block_df["block_score"] > 0]

    # post search
    search_post_df["post_score"] = search_post_df.apply(metric, axis = 1)
    search_post_df = search_post_df.sort_values("post_score", ascending=False)
    search_post_df = search_post_df[search_post_df["post_score"] > 0]

    return search_block_df, search_post_df
