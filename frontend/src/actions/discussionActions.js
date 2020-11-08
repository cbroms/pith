import { socket } from "./socket";
import { getValue, setValue } from "../api/local";
import { cleanUpRequest, createRequestWrapper } from "./queue";
import {
  unpackCursors,
  unpackChildren,
  unpackBacklinks,
  unpackTimelineEntry,
  unpackTimeline,
  unpackContext,
  unpackChatMeta,
  unpackDocMeta,
} from "./utils";
import {
  GENERIC_ERROR,
  INVALID_DISCUSSION,
  TAKEN_NICKNAME,
  TAKEN_USER_ID,
  MOVE_UNABLED,
  EDIT_UNABLED,
  BAD_TARGET,
} from "../utils/errors";
import {
  INVALID_USER_SESSION,
  BAD_REQUEST,
  BAD_RESPONSE,
  BAD_DISCUSSION_ID,
  BAD_USER_ID,
  BAD_UNIT_ID,
  BAD_POSITION,
  BAD_EDIT_TRY,
  BAD_POSITION_TRY,
  BAD_PARENT,
  FAILED_EDIT_ACQUIRE,
  FAILED_POSITION_ACQUIRE,
  NICKNAME_EXISTS,
  USER_ID_EXISTS,
} from "./errors";
import {
  TEST_CONNECT, 
  CREATE_USER, 
  JOIN_USER, 
  CREATE_POST, 
  LOAD_USER, 
  LOAD_UNIT_PAGE, 
  GET_CONTEXT, 
  SEARCH, 
  SEND_TO_DOC, 
  ADD_UNIT, 
  HIDE_UNIT, 
  UNHIDE_UNIT, 
  SELECT_UNIT, 
  DESELECT_UNIT, 
  MOVE_UNITS, 
  REQUEST_EDIT_UNIT, 
  DEEDIT_UNIT, 
  EDIT_UNIT, 
} from "./types";

import {
  SYSTEM_ERROR,
  INVALID_DISCUSSION,
  TAKEN_NICKNAME,
  TAKEN_USER_ID,
  MOVE_UNABLED,
  EDIT_UNABLED,
  BAD_TARGET,
  REQUEST_TIMEOUT,
  CHAT_MAP,
  DOC_MAP,
  CREATE_NICKNAME,
  TEST_CONNECT,
  TEST_CONNECT_FULFILLED,
  CREATE_USER,
  CREATE_USER_FULFILLED,
  JOIN_USER,
  JOIN_USER_FULFILLED,
  LOAD_USER,
  LOAD_USER_FULFILLED,
  LOADED_USER,
  LOAD_UNIT_PAGE,
  LOAD_UNIT_PAGE_FULFILLED,
  CREATE_POST,
  CREATE_POST_FULFILLED,
  GET_CONTEXT,
  GET_CONTEXT_FULFILLED,
  SEARCH,
  SEARCH_FULFILLED,
  SEND_TO_DOC,
  SEND_TO_DOC_FULFILLED,
  ADD_UNIT,
  ADD_UNIT_FULFILLED,
  HIDE_UNIT,
  HIDE_UNIT_FULFILLED,
  UNHIDE_UNIT,
  UNHIDE_UNIT_FULFILLED,
  SELECT_UNIT,
  SELECT_UNIT_FULFILLED,
  DESELECT_UNIT,
  DESELECT_UNIT_FULFILLED,
  MOVE_UNITS,
  MOVE_UNITS_FULFILLED,
  REQUEST_EDIT_UNIT,
  REQUEST_EDIT_UNIT_FULFILLED,
  DEEDIT_UNIT,
  DEEDIT_UNIT_FULFILLED,
  EDIT_UNIT,
  EDIT_UNIT_FULFILLED,
  JOINED_USER,
  CREATED_POST,
  ADDED_UNIT,
  REMOVED_UNIT,
  ADDED_BACKLINK,
  REMOVED_BACKLINK,
  HID_UNIT,
  UNHID_UNIT,
  LOCKED_EDIT,
  UNLOCKED_EDIT,
  LOCKED_POSITION,
  UNLOCKED_POSITION,
} from "../reducers/types";

const isError = (response) => {
  return Object.keys(response).includes("error");
};

const getStatus(response, dispatch, errorMap) {
    let statusCode = null;
    if (isError(response)) {
      const errorStamp = response.error;
      for (const key in errorMap) {
        if (errorStamp === key) {
          statusCode = errorMap[key];
          break;
        }
      }
      if (statusCode === null) {
          statusCode = GENERIC_ERROR;
          dispatch({
            type: SYSTEM_ERROR,
          });
      }
    }
    return statusCode;
}

const loadUser = (dispatch, discussionId, userId, requestId) => {
  const start = performance.now();

  const data = {};

  const [startRequest, endRequest] = createRequestWrapper(dispatch);

  startRequest(() => {
    dispatch({
      type: LOAD_USER,
    });

    socket.emit("load_user", data, (res) => {
      endRequest();
      const response = JSON.parse(res);
      if (isError(response)) {
        handleError(dispatch, response);
      } else {
        const chatMeta = unpackChatMeta(response.chat_meta);
        const docMeta = unpackDocMeta(response.doc_meta);
        const timeline = unpackTimeline(response.timeline);
        const cursors = unpackCursors(response.cursors);
        const end = performance.now();
        console.log("returned ", end - start);
        dispatch({
          type: CHAT_MAP,
          payload: {
            chatMapAdd: chatMeta,
          },
        });
        dispatch({
          type: DOC_MAP,
          payload: {
            docMapAdd: docMeta,
          },
        });
        dispatch({
          type: LOADED_USER,
          payload: {
            icons: cursors,
            currentUnit: response.current_unit,
            timeline: timeline,
            chatHistory: response.chat_history || [],
          },
        });
      }

      cleanUpRequest(requestId, () =>
        dispatch({
          type: LOAD_USER_FULFILLED,
        })
      );
    });
  });
};

const joinUser = (discussionId, userId, requestId) => {
  const data = {
    discussion_id: discussionId,
    user_id: userId,
  };

  const [startRequest, endRequest] = createRequestWrapper(dispatch);

  startRequest(() => {
    dispatch({
      type: JOIN_USER,
    });

    socket.emit("join", data, (res) => {
      endRequest();
      const response = JSON.parse(res);
      if (isError(response)) {
        handleError(dispatch, response);
      }
    });

    cleanUpRequest(requestId, () => {
      dispatch({
        type: JOIN_USER_FULFILLED,
        payload: {
          discussionId: discussionId,
          userId: userId,
        },
      });
    });
  });
};

// TODO model
const enterDiscussion = (discussionId, requestId) => {
  return (dispatch) => {
    const data = {
      discussion_id: discussionId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      TEST_CONNECT,
      dispatch,
      requestId
    );

    startRequest(() => {
      socket.emit("test_connect", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {
          BAD_DISCUSSION_ID: INVALID_DISCUSSION
        });

        if (statusCode === null) { // success 
          const userId = getValue(discussionId);
          if (userId === null) {
            statusCode = NO_USER_ID, // need to call createUser
          }
        }

        endRequest(statusCode);
      });
    });
  };
};

const createUser = (discussionId, nickname, requestId) => {
  return (dispatch) => {
    const data = {
      discussion_id: discussionId,
      nickname: nickname,
    };
    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() => {
      dispatch({
        type: CREATE_USER,
      });

      socket.emit("create_user", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          // set the value in localStorage
          const userId = response.user_id;
          setValue(discussionId, userId);

          //handleJoinUser(dispatch, discussionId, userId);
        }
        cleanUpRequest(requestId, () => {
          dispatch({
            type: CREATE_USER_FULFILLED,
          });
        });
      });
    });
  };
};

const getPage = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: LOAD_UNIT_PAGE,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("load_unit_page", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          const children = unpackChildren(response.children);
          const backlinks = unpackBacklinks(response.backlinks);
          const timelineEntry = unpackTimelineEntry(response.timeline_entry);
          const docMeta = unpackDocMeta(response.doc_meta);
          dispatch({
            type: DOC_MAP,
            payload: {
              docMapAdd: docMeta,
            },
          });
          dispatch({
            type: LOAD_UNIT_PAGE_FULFILLED,
            ancestors: response.ancestors,
            currentUnit: response.cursor.unit_id,
            timelineEntry: timelineEntry,
            children: children,
            backlinks: backlinks,
          });
        }
      })
    );
  };
};

const createPost = (pith, requestId) => {
  return (dispatch) => {
    const data = {
      pith: pith,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      dispatch,
      requestId
    );

    startRequest(() => {
      // report to UI the attempt
      dispatch({
        type: CREATE_POST,
        payload: {
          pith: pith,
        },
      });
      socket.emit("post", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          cleanUpRequest(requestId, () => {
            dispatch({
              type: CREATE_POST_FULFILLED,
            });
          });
          handleError(dispatch, response);
        }
        // the pending complete is handled when we get the response from an emit
      });
    });
  };
};

const getContext = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: GET_CONTEXT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("get_unit_context", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          const context = unpackContext(response);
          dispatch({
            type: GET_CONTEXT_FULFILLED,
            context: context,
          });
        }
      })
    );
  };
};

const search = (query) => {
  return (dispatch) => {
    const data = {
      query: query,
    };

    dispatch({
      type: SEARCH,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("search", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          const chatMeta = unpackChatMeta(response.chat_meta);
          const docMeta = unpackDocMeta(response.doc_meta);
          dispatch({
            type: CHAT_MAP,
            payload: {
              chatMapAdd: chatMeta,
            },
          });
          dispatch({
            type: DOC_MAP,
            payload: {
              docMapAdd: docMeta,
            },
          });
          dispatch({
            type: SEARCH_FULFILLED,
            chatResults: response.chat_units,
            docResults: response.doc_units,
          });
        }
      })
    );
  };
};

const sendToDoc = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: SEND_TO_DOC,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("send_to_doc", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: SEND_TO_DOC_FULFILLED,
          });
        }
      })
    );
  };
};

const addUnit = (pith, parentUnit, position) => {
  return (dispatch) => {
    const data = {
      pith: pith,
      parent: parentUnit,
      position: position,
    };

    dispatch({
      type: ADD_UNIT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("add_unit", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: ADD_UNIT_FULFILLED,
          });
        }
      })
    );
  };
};

const hideUnit = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: HIDE_UNIT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("hide_unit", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: HIDE_UNIT_FULFILLED,
          });
        }
      })
    );
  };
};

const unhideUnit = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: UNHIDE_UNIT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("unhide_unit", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: UNHIDE_UNIT_FULFILLED,
          });
        }
      })
    );
  };
};

const selectUnit = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: SELECT_UNIT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("select_unit", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: SELECT_UNIT_FULFILLED,
          });
        }
      })
    );
  };
};

const deselectUnit = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: DESELECT_UNIT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("deselect_unit", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: DESELECT_UNIT_FULFILLED,
          });
        }
      })
    );
  };
};

// TODO moveUnit for drag-and-drop or keyboard

const moveUnits = (units, parentUnit, position) => {
  return (dispatch) => {
    const data = {
      units: units,
      parent: parentUnit,
      position: position,
    };

    dispatch({
      type: MOVE_UNITS,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("move_units", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: MOVE_UNITS_FULFILLED,
          });
        }
      })
    );
  };
};

const requestEdit = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: REQUEST_EDIT_UNIT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("request_to_edit", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: REQUEST_EDIT_UNIT_FULFILLED,
          });
        }
      })
    );
  };
};

const deeditUnit = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: DEEDIT_UNIT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("deedit_unit", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: DEEDIT_UNIT_FULFILLED,
          });
        }
      })
    );
  };
};

const editUnit = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: EDIT_UNIT,
    });

    const [startRequest, endRequest] = createRequestWrapper(dispatch);

    startRequest(() =>
      socket.emit("edit_unit", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: EDIT_UNIT_FULFILLED,
          });
        }
      })
    );
  };
};

const subscribeUsers = () => {
  return (dispatch) => {
    socket.on("joined_user", (res) => {
      const response = JSON.parse(res);
      if (isError(response)) {
        handleError(dispatch, response);
      } else {
        dispatch({
          type: JOINED_USER,
          payload: {
            icon: {
              userId: response.user_id,
              nickname: response.nickname,
              unitId: response.cursor.unit_id,
            },
          },
        });
      }
    });
  };
};

const subscribeChat = () => {
  return (dispatch) => {
    socket.on("created_post", (res) => {
      const response = JSON.parse(res);
      const chatMeta = unpackChatMeta(response.chat_meta);
      const docMeta = unpackDocMeta(response.doc_meta);
      dispatch({
        type: CHAT_MAP,
        payload: {
          chatMapAdd: chatMeta,
        },
      });
      dispatch({
        type: DOC_MAP,
        payload: {
          docMapAdd: docMeta,
        },
      });
      dispatch({
        type: CREATED_POST,
        payload: {
          unitId: response.unit_id,
        },
      });

      // signify that the create post funciton is complete and we can move on the
      // queue to the next request
      cleanUpRequest(response.id, () => {
        // this is executed if the id is in our requests map
        dispatch({
          type: CREATE_POST_FULFILLED,
        });
      });
    });
  };
};

const subscribeDocument = () => {
  return (dispatch, getState) => {
    socket.on("added_unit", (res) => {
      const response = JSON.parse(res);
      const chatMeta = unpackChatMeta(response.chat_meta);
      const docMeta = unpackDocMeta(response.doc_meta);
      dispatch({
        type: CHAT_MAP,
        payload: {
          chatMapAdd: chatMeta,
        },
      });
      dispatch({
        type: DOC_MAP,
        payload: {
          docMapAdd: docMeta,
        },
      });
      dispatch({
        type: ADDED_UNIT,
        payload: {
          unitId: response.unit_id,
          parent: response.parent,
          position: response.position,
        },
      });
    });

    socket.on("edited_unit", (res) => {
      const response = JSON.parse(res);
      const chatMeta = unpackChatMeta(response.chat_meta);
      const docMeta = unpackDocMeta(response.doc_meta);
      dispatch({
        type: CHAT_MAP,
        payload: {
          chatMapAdd: chatMeta,
        },
      });
      dispatch({
        type: DOC_MAP,
        payload: {
          docMapAdd: docMeta,
        },
      });
    });

    socket.on("added_backlinks", (res) => {
      const response = JSON.parse(res);
      for (const entry in response) {
        dispatch({
          type: ADDED_BACKLINK,
          payload: {
            unitId: entry.unit_id,
            backlink: entry.backlink,
          },
        });
      }
    });

    socket.on("removed_backlinks", (res) => {
      const response = JSON.parse(res);
      for (const entry in response) {
        dispatch({
          type: REMOVED_BACKLINK,
          payload: {
            unitId: entry.unit_id,
            backlink: entry.backlink,
          },
        });
      }
    });

    socket.on("hid_unit", (res) => {
      const response = JSON.parse(res);
      // change state if we have cached this
      const state = getState();
      if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
        dispatch({
          type: HID_UNIT,
          payload: {
            unitId: response.unit_id,
          },
        });
      }
    });

    socket.on("unhid_unit", (res) => {
      const response = JSON.parse(res);
      // change state if we have cached this
      const state = getState();
      if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
        dispatch({
          type: HID_UNIT,
          payload: {
            unitId: response.unit_id,
          },
        });
      }
    });

    socket.on("repositioned_unit", (res) => {
      const response = JSON.parse(res);
      for (const entry in response) {
        dispatch({
          type: ADDED_UNIT,
          payload: {
            unitId: entry.unit_id,
            parent: entry.parent,
            position: entry.position,
          },
        });
        dispatch({
          type: REMOVED_UNIT,
          payload: {
            unitId: entry.unit_id,
            parent: entry.old_parent,
            position: entry.old_position,
          },
        });
      }
    });

    socket.on("locked_unit_editable", (res) => {
      const response = JSON.parse(res);
      const state = getState();
      if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
        dispatch({
          type: LOCKED_EDIT,
          payload: {
            unitId: response.unit_id,
            nickname: response.nickname,
          },
        });
      }
    });

    socket.on("unlocked_unit_editable", (res) => {
      const response = JSON.parse(res);
      const state = getState();
      if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
        dispatch({
          type: UNLOCKED_EDIT,
          payload: {
            unitId: response.unit_id,
          },
        });
      }
    });

    socket.on("locked_unit_position", (res) => {
      const response = JSON.parse(res);
      const state = getState();
      if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
        dispatch({
          type: LOCKED_POSITION,
          payload: {
            unitId: response.unit_id,
            nickname: response.nickname,
          },
        });
      }
    });

    socket.on("unlocked_unit_position", (res) => {
      const response = JSON.parse(res);
      const state = getState();
      if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
        dispatch({
          type: UNLOCKED_POSITION,
          payload: {
            unitId: response.unit_id,
          },
        });
      }
    });
  };
};

export {
  enterDiscussion,
  createUser,
  getPage,
  createPost,
  getContext,
  search,
  sendToDoc,
  addUnit,
  hideUnit,
  unhideUnit,
  selectUnit,
  deselectUnit,
  moveUnits,
  requestEdit,
  deeditUnit,
  editUnit,
  subscribeUsers,
  subscribeChat,
  subscribeDocument,
};
