join = {
  "type": "object",
  "properties": {
    "discussion_id": {"type": "string"},
    "user_id": {"type": "string"},
    "name": {"type": "string"},
  },
  "required": ["discussion_id", "user_id", "name"],
}

create_post = {
  "type": "object",
  "properties": {
    "blocks": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["blocks"],
}

get_block = {
  "type": "object",
  "properties": {
    "block_id": {"type": "string"},
  },
  "required": ["block_id"],
}

save_block = {
  "type": "object",
  "properties": {
    "block_id": {"type": "string"},
  },
  "required": ["block_id"],
}

unsave_block = {
  "type": "object",
  "properties": {
    "block_id": {"type": "string"},
  },
  "required": ["block_id"],
}

block_add_tag = { 
  "type": "object",
  "properties": {
    "block_id": {"type": "string"},
    "tag": {"type": "string"},
  },
  "required": ["block_id", "tag"],
}

block_remove_tag = {
  "type": "object",
  "properties": {
    "block_id": {"type": "string"},
    "tag": {"type": "string"},
  },
  "required": ["block_id", "tag"],
}

search_basic = {
  "type": "object",
  "properties": {
    "query": {"type": "string"},
  },
  "required": ["query"],
}

search_tags = {
  "type": "object",
  "properties": {
    "tags": {"type": "string"},
  },
  "required": ["tags"],
}

search_user_saved_basic = {
  "type": "object",
  "properties": {
    "query": {"type": "string"},
  },
  "required": ["query"],
}

search_user_saved_tags = {
  "type": "object",
  "properties": {
    "tags": {"type": "string"},
  },
  "required": ["tags"],
}

summary_add_block = {
  "type": "object",
  "properties": {
    "body": {"type": "string"},
  },
  "required": ["body"],
}

summary_modify_block = {
  "type": "object",
  "properties": {
    "block_id": {"type": "string"},
    "body": {"type": "string"},
  },
  "required": ["block_id", "body"],
}

summary_remove_block = {
  "type": "object",
  "properties": {
    "block_id": {"type": "string"},
  },
  "required": ["block_id"],
}
