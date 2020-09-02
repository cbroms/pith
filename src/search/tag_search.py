from datetime import datetime

from constants import DATE_TIME_FMT


def make_metric(query_tags):
    def metric(tags):
        score = sum([1 for t in query_tags if t in tags])
        return score
    return metric


def tag_search(tags, blocks):
    metric = make_metric(tags)

    blocks_order = [(
        metric(set(t.tag for t in b.tags)),
        b.created_at, #datetime.strptime(b.created_at, DATE_TIME_FMT),
        b.id
    ) for b in blocks]
    blocks_order.sort(reverse=True)
    block_ids = [b for f, t, b in blocks_order if f > 0]
    return block_ids
