# TODO: documentation for schema
# TODO: cursor, time_interval

join = {
  "type": "object",
  "properties": {
    "nickname": {"type": "string"},
  },
  "required": ["nickname"],
}

leave = {
  "type": "object",
  "properties": {
    "nickname": {"type": "string"},
  },
  "required": ["nickname"],
}

"""
- **cursors** (*Dict[string,Cursor]*) - Map of active user IDs to cursor positions. 
- **current_unit** (*str*) - ID of the unit the user was last looking at.
- **timeline** (*List[TimeInterval]*) - List of the units visited via the cursor.
- **chat_history** - List of the posts:

  - **created_at** (*datetime*) - Creation time of unit. 
  - **author** (*string*) - Nickname of the author.
  - **units** (*List[string]*) - List of unit IDs.
"""
load = {
  "type": "object",
  "properties": {
    "cursors": {"type": {
      "type": "object",
      "additionalProperties" : { # map arbitrary string (user_id) to cursor
        "$ref": "file:cursor.json"
      },
    }},
    "current_unit": {"type": "string"},
    "timeline": {
      "type" : "array",
      "items": {"$ref": "file:time_interval.json"},
    }, 
    "chat_history": {
      "type": "object",
      "properties": {
        "created_at": {"type": "string"},
        "author": {"type": "string"},
        "units": {
          "type": "array",
          "items": {"type": "string"}
        },
      },
      "required": ["created_at", "author", "units"]
    },
  },
  "required": ["cursors", "current_unit", "timeline", "chat_history"],
}

create_user = {
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
  },
  "required": ["user_id"],
}

"""
- **pith** (*str*) - Pith of the unit.
- **ancestors** (*List[str]*) - Ancestors of the unit, including self.
- **children** - List of tuples, where each tuple has a children unit ID and the list of children for that unit.
- **backlinks** - List of tuples, where each tuple has a backlink unit ID and the list of backlinks for that unit.
"""
get_unit_page = {
  "type": "object",
  "properties": {
    "pith": {"type": "string"},
    "ancestors": {
      "type": "array",
      "items": {"type": "string"}, 
    },
    "children": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "unit_id": {"type": "string"},
          "children": {
            "type": "array",
            "items": {"type": "string"},
          },
        },
        "required": ["unit_id", "children"] 
      }
    }
    "backlinks": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "unit_id": {"type": "string"},
          "backlinks": {
            "type": "array",
            "items": {"type": "string"},
          },
        },
        "required": ["unit_id", "backlinks"] 
      }
    },
  },
  "required": ["pith", "ancestors", "children", "backlinks"],
}

"""
- **pith** (*str*) - Pith of the unit.
- **hidden** (*bool*) - Whether the unit is hidden, default false. 
"""
get_unit_content = {
  "type": "object",
  "properties": {
    "pith": {"type": "string"},
    "hidden": {"type": "boolean"},
  },
  "required": ["pith", "hidden"],  
}

"""
- **pith** (*str*) - Pith of the unit.
- **children** (*List[str]*) - List of children unit IDs. 
"""
get_unit_context = {
  "type": "object",
  "properties": {
    "pith": {"type": "string"},
    "children": {
      "type": "array",
      "items": {"type": "string"},
    },
  },
  "required": ["pith", "children"],
}

"""
- **created_at** (*datetime*) - Creation time of unit. 
- **author** (*str*) - Nickname of the author. 
- **piths** (*List[str]*) - List of pith strings, one per unit.
"""
post = {
  "type": "object",
  "properties": {
    "created_at": {"type": "string"},
    "author": {"type": "string"},
    "piths": {
      "type": "array",
      "items": {"type": "string"},
    },
  },
  "required": ["created_at", "author", "piths"],
}

"""
- **units** - List of unit IDs, sorted in order of relevance.
"""
search = {
  "type": "object",
  "properties": {
    "units": {
      "type": "array",
      "items": {"type": "string"},
    },
  },
  "required": ["units"],
}

move_cursor = {
  "type": "object",
  "properties": {
    "user_id": {"type": "string"},
    "position": {"type": "integer", "minimum": 0}
  },
  "required": ["user_id", "position"],
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

"""
- **unit_id** (*str*) - Unit ID.
- **pith** (*str*) - Pith of the unit.
- **created_at** (*datetime*) - Creation time of unit. 
- **parent** (*str*) - Parent unit ID unit was added to.
- **position** (*int*) - Index of unit in parent.
"""
added_unit = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
    "pith": {"type": "string"},
    "created_at": {"type": "string"},
    "parent": {"type": "string"},
    "position": {"type": "integer", "minimum": 0}
  },
  "required": ["unit_id", "pith", "created_at", "parent", "position"],
}

"""
- **unit_id** (*str*) - Unit ID.
- **nickname** (*str*) - Nickname of user with unit's position lock.
"""
locked_unit_position = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
    "nickname": {"type": "string"},
  },
  "required": ["unit_id", "nickname"],
}

"""
- **unit_id** (*str*) - Unit ID.
- **parent** (*str*) - Parent unit ID.
- **position** (*int*) - Position of unit in parent unit.
- **old_parent** (*str*) - Old parent unit ID.
- **old_position** (*int*) - Position of unit in old parent unit.
"""
repositioned_unit = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
    "parent": {"type": "string"},
    "position": {"type": "integer", "minimum": 0},
    "old_parent": {"type": "string"},
    "old_position": {"type": "integer", "minimum": 0},
  },
  "required": ["unit_id", "parent", "position", "old_parent", "old_position"],
}

"""
- **unit_id** (*str*) - Unit ID.
- **nickname** (*str*) - Nickname of user holding the edit lock.
"""
locked_unit_editable = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
    "nickname": {"type": "string"},
  },
  "required": ["unit_id", "nickname"],
}

"""
- **unit_id** (*str*) - Unit ID.
- **pith** (*str*) - Pith of the unit.
"""
edited_unit = { 
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
    "pith": {"type": "string"},
  },
  "required": ["unit_id", "pith"],
}

removed_backlink = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
    "backlink": {"type": "string"},
  },
  "required": ["unit_id", "backlink"],
}

added_backlink = {
  "type": "object",
  "properties": {
    "unit_id": {"type": "string"},
    "backlink": {"type": "string"},
  },
  "required": ["unit_id", "backlink"],
}

"""
- ancestors - List of ancestor unit IDs, from most recent to oldest.
"""
get_ancestors = {
  "type": "object",
  "properties": {
    "ancestors": {
      "type": "array",
      "items": {"type": "string"},
    }
  },
  "required": ["ancestors"],
}
