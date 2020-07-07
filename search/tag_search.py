from datetime import datetime

from models.post import date_time_fmt


def make_metric(query_tags):
    def metric(tags):
        score = sum([1 for t in query_tags if t in tags])
        return score
    return metric


def tag_search(tags, blocks_data, posts_data): 
    metric = make_metric(tags)

    blocks_order = [(
        metric(set(b["tags"].keys())),
        datetime.strptime(b["created_at"], 
            date_time_fmt
        ),
        b["_id"]
    ) for b in blocks_data]
    blocks_order.sort(reverse=True)
    block_ids = [b for f,t,b in blocks_order if f > 0]

    posts_order = [(
        metric(set(p["tags"].keys())),
        datetime.strptime(p["created_at"], 
            date_time_fmt
        ),
        p["_id"]
    ) for p in posts_data]
    posts_order.sort(reverse=True)
    post_ids = [p for f,t,p in posts_order if f > 0]

    result = {"blocks": block_ids, "posts": post_ids}
    return result
