import sys
sys.path.append("..")

import pandas as pd
from basic_search import basic_search


block_data = {
    "block_id":["104", "205", "504", "209"],
    "post_id":["34", "26", "34", "17"],
    "freq_dict":[              
      {"the":1, "wordly":1,},
      {"fast":1, "good":1, "whales":1},
      {"the":2, "good":1, "whales":1},
      {"fast":3},
    ]
}
block_df = pd.DataFrame.from_dict(block_data)
block_update_dict = {
    "945": {"freq_dict": {"good": 2, "fast": 1}},
    "219": {"freq_dict": {"whales":5}}
}

post_data = {
    "post_id": ["34", "26", "17"],
    "freq_dict": [
        {"the":3, "wordly":1, "good":1, "whales":1},
      {"fast":1, "good":1, "whales":1},
      {"fast":3},
    ]
}
post_df = pd.DataFrame.from_dict(post_data)
post_update_dict = {
    "27": {"freq_dict": {"good": 2, "fast": 1, "whales": 5}}
}

block_search, post_search = basic_search(
    ["the", "fast", "wordly", "good", "whales"], 
    block_df,
    block_update_dict,
    post_df,
    post_update_dict,
)

print("Block Search\n{}\nPost Search\n{}\n".format(block_search, post_search))
