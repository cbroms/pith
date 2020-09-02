from datetime import datetime
from typing import (
  Callable,
  List,
  Set,
)

from models.discussion import Block
from constants import DATE_TIME_FMT


def make_metric(query_tags: List[str]) -> Callable[[Set[str]], float]:

    def metric(tags: Set[str]) -> float:
        score = sum([1 for t in query_tags if t in tags])
        return score

    return metric


def tag_search(tags: List[str], blocks: List[Block]) -> List[str]:
    metric = make_metric(tags)

    blocks_order = [(
        metric(set(t.tag for t in b.tags)),
        b.created_at,
        b.id
    ) for b in blocks]
    blocks_order.sort(reverse=True)
    block_ids = [b for f, t, b in blocks_order if f > 0]
    return block_ids
