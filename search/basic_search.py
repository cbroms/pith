from datetime import datetime
import math
import nltk
from nltk import pos_tag
from nltk.stem import PorterStemmer
from operator import itemgetter
import pandas as pd
from threading import Lock

from models.post import Post, date_time_fmt
from models.block import Block

import database
import utils


nltk.download('averaged_perceptron_tagger')
ps = PorterStemmer()


# very rudimentary and misses things like pronouns and adverbs
def assign_pos_weight(cat):
    if cat.find("JJ") > -1: # adjective
        return 1
    elif cat.find("NN") > -1: # noun
        return 1
    elif cat.find("VB") > -1: # verb
        return 1
    elif cat.find("CD") > -1: # cardinal number
        return 1
    elif cat.find("PRP") > -1: # personal pronoun
        return 1
    elif cat.find("RB") > -1: # adverb
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


# TODO make more elegant
def basic_search(key_word_list, block_ids, post_ids): 
    key_word_list = utils.text_tokens(query)

    posts_obj = {p:Post(**database.get_post(p)) for p in post_ids}
    blocks_obj = {b:Block(**database.get_block(b)) for b in block_ids}

    blocks = []
    posts = []
    for k in key_word_list:
        blocks += [(b,k,blocks_obj[b].freq_dict[k]) for b in block_ids] 
        posts += [(p,k,posts_obj[p].freq_dict[k]) for p in post_ids] 

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
        blocks_order.append((
            metric(F),
            datetime.strptime(
                database.get_post(database.get_block(b)["post"])["created_at"], 
                date_time_fmt
            ),
            b 
        ))
    blocks_order.sort(reverse=True)

    posts_order = []
    for p,F in posts_freq.items():
        posts_order.append((
            metric(F),
            datetime.strptime(database.get_post(p)["created_at"], 
                date_time_fmt
            ),
            p 
        ))
    posts_order.sort(reverse=True)

    blocks_order = [b for f,t,b in blocks_order if f > 0]
    posts_order = [p for f,t,p in posts_order if f > 0]

    result = {"blocks": block_ids, "posts": post_ids}
    return results
