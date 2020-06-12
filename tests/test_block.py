import sys
sys.path.append('.')


from models.block import Block


body = "I am so excited about this! I love whales! "\
    + "What're we going to do with this whale?!"
block_obj = Block("12345", "67890", body)
print(block_obj.freq_dict)
