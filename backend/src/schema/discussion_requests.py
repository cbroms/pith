create_user = {
  "type": "object",
  "properties": {
    "discussion_id": {"type": "string"},
    "nickname": {"type": "string"},
  },
  "required": ["discussion_id", "nickname"],
}

join = {
  "type": "object",
  "properties": {
    "discussion_id": {"type": "string"},
    "user_id": {"type": "string"},
  },
  "required": ["discussion_id", "user_id"],
}

get_unit_page = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}

get_unit_content = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}

get_unit_context = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}

post = {
  "type": "object",
  "properties": {
    "piths": {
      "type": "array",
      "items": {"type": "string"},
    },
  },
  "required": ["piths"],
}

search = {
  "type": "object",
  "properties": {
    "query": {"type": "string"},
  },
  "required": ["query"],
}

send_to_doc = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}

"""
position - -1 means streaming
"""
move_cursor = {
  "type": "object",
  "properties": {
    "position": {"type": "integer", "minimum": -1}
  },
  "required": ["position"],
}

hide_unit = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}

unhide_unit = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}

add_unit = {
  "type": "object",
  "properties": {
    "pith": {"type": "string"},
  },
  "required": ["pith"],
}

select_unit = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}

move_units = {
  "type": "object",
  "properties": {
    "units": {
      "type": "array",
      "items": {"type": "string"},
    },
    "parent": {"type": "string"},
  },
  "required": ["units", "parent"],
}

merge_units = {
  "type": "object",
  "properties": {
    "units": {
      "type": "array",
      "items": {"type": "string"},
    },
    "parent": {"type": "string"},
  },
  "required": ["units", "parent"],
}

request_to_edit = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}

edit_unit = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
    "pith": {"type": "string"},
  },
  "required": ["unit_id", "pith"],
}

get_ancestors = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
  },
  "required": ["unit_id"],
}
