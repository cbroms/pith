from datetime import datetime
import math
import nltk
from nltk import pos_tag
from nltk.stem import PorterStemmer

from constants import DATE_TIME_FMT

from utils import utils


nltk.download('averaged_perceptron_tagger', quiet=True)
ps = PorterStemmer()


# very rudimentary and misses things like pronouns and adverbs
def assign_pos_weight(cat):
    if cat.find("JJ") > -1:  # adjective
        return 1
    elif cat.find("NN") > -1:  # noun
        return 1
    elif cat.find("VB") > -1:  # verb
        return 1
    elif cat.find("CD") > -1:  # cardinal number
        return 1
    elif cat.find("PRP") > -1:  # personal pronoun
        return 1
    elif cat.find("RB") > -1:  # adverb
        return 1
    else:
        return 0


def make_metric(key_word_list):
    stemmed = [ps.stem(w) for w in key_word_list]
    pos = pos_tag(key_word_list)
    weights = {w: assign_pos_weight(c) for w, c in pos}

    def metric(fd):
        score = 0
        word_freq = {w: fd[w] for w in key_word_list if w in fd}
        word_score = [weights[w] * math.log(f + 1) for w, f in word_freq.items()]
        return sum(word_score)

    return metric


def basic_search(query, blocks):
    key_word_list = list(set(utils.text_tokens(query)))
    metric = make_metric(key_word_list)

    blocks_order = [(
        metric(b.freq_dict),
        b.created_at, #datetime.strptime(b.created_at, DATE_TIME_FMT),
        b.id
    ) for b in blocks]
    blocks_order.sort(reverse=True)
    block_ids = [b for f, t, b in blocks_order if f > 0]

    return block_ids
