import math
import nltk
from nltk import pos_tag
from nltk.stem import PorterStemmer
from operator import itemgetter
import pandas as pd
from threading import Lock

import database


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

    def metric(fd):
        score = 0
        word_freq = {w:fd[w] for w in key_word_list if w in fd}
        word_score = [weights[w] * math.log(f + 1) for w,f in word_freq.items()]
        return sum(word_score)

    return metric


def basic_search(key_word_list, blocks, posts): 
    key_word_list = list(set(key_word_list))

    metric = make_metric(key_word_list)

    blocks_freq = {}
    for b,k,f in blocks:
        if b not in blocks_freq: blocks_freq[b] = {}
        blocks_freq[b][k] = f

    posts_freq = {}
    for p,k,f in posts:
        if p not in posts_freq: posts_freq[p] = {}
        posts_freq[p][k] = f

    blocks_order = []
    for b,F in blocks_freq.items():
        blocks_order.append((b, metric(F)))
    blocks_order.sort(key=itemgetter(1), reverse=True)

    posts_order = []
    for p,F in posts_freq.items():
        posts_order.append((p, metric(F)))
    posts_order.sort(key=itemgetter(1), reverse=True)

    return blocks_order, posts_order


def all_scope_search(key_word_list):
    blocks = []
    posts = []
    for k in key_word_list:
        blocks += [(b,k,f["freq"]) \
            for b,f in database.get_keyword_blocks(k).items()] 
        posts += [(p,k,f["freq"]) \
            for p,f in database.get_keyword_posts(k).items()] 

    return basic_search(key_word_list, blocks, posts)


# can filter by user here (later)
def discussion_scope_search(key_word_list, discussion_id):
    post_ids = database.get_discussion_posts(discussion_id)
    block_ids = database.get_discussion_blocks(discussion_id)

    blocks = []
    posts = []
    for k in key_word_list:
        blocks += [(b,k,f[k]) for b in block_ids] 
        posts += [(p,k,f[k]) for p in post_ids] 

    return basic_search(key_word_list, blocks, posts)


# can filter by discussion here (later)
def user_saved_scope_search(key_word_list, user_id):
    post_ids = database.get_user_saved_posts(user_id)
    block_ids = database.get_user_saved_blocks(user_id)

    blocks = []
    posts = []
    for k in key_word_list:
        blocks += [(b,k,f[k]) for b in block_ids] 
        posts += [(p,k,f[k]) for p in post_ids] 

    return basic_search(key_word_list, blocks, posts)
