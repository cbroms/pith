create = {
  "type": "object",
  "properties": {
    "title": {"type": "string"},
    "theme": {"type": "string"},
    "time_limit": {"type": "number"},
    "block_char_limit": {"type": "number"},
    "summary_char_limit": {"type": "number"},
  },
}

remove = {
  "type": "object",
  "properties": {
    "discussion_id": {"type": "string"},
  },
  "required": ["discussion_id"],
}

create_user = {
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
  },
  "required": ["user_id"],
}
