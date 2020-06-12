import sys
sys.path.append("..")

import pandas as pd
from basic_search import basic_search

data = {
    "block_id":["104", "205", "504", "209"],
    "post_id":["34", "26", "34", "17"],
    "freq_dict":[              
      {"the":1, "wordly":1,},
      {"fast":1, "good":1, "whales":1},
      {"the":2, "good":1, "whales":1},
      {"fast":3},
    ]
}
block_df = pd.DataFrame.from_dict(data)

update_dict = {
    "945": {"post_id": "27", "freq_dict": {"good": 2, "fast": 1}},
    "219": {"post_id": "27", "freq_dict": {"whales":5}}
}

block_search, post_search = basic_search(
    ["the", "fast", "wordly", "good", "whales"], 
    block_df,
    update_dict
)

print("Block Search")
print(block_search)
print()

print("Post Search")
print(post_search)
print()
