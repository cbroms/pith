import { socket } from "./socket";
import { getValue, setValue } from "../api/local";
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
  SYSTEM_ERROR,
  INVALID_DISCUSSION,
  TAKEN_NICKNAME,
  TAKEN_USER_ID,
  MOVE_UNABLED,
  EDIT_UNABLED,
  BAD_TARGET,
  REQUEST_TIMEOUT,
  RESET_REQUEST_TIMEOUT,
  CREATE_NICKNAME,
  CREATE_USER,
  CREATE_USER_FULFILLED,
  JOIN_USER,
  JOIN_USER_FULFILLED,
  LOAD_USER,
  LOAD_USER_FULFILLED,
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
  MOVE_UNIT,
  MOVE_UNIT_FULFILLED,
  REQUEST_EDIT_UNIT,
  REQUEST_EDIT_UNIT_FULFILLED,
  DEEDIT_UNIT,
  DEEDIT_UNIT_FULFILLED,
  EDIT_UNIT,
  EDIT_UNIT_FULFILLED,
  JOINED_USER,
  CREATED_POST,
  ADDED_UNIT,
  EDITED_UNIT,
  ADDED_BACKLINKS,
  REMOVED_BACKLINKS,
  HID_UNIT,
  UNHID_UNIT,
  REPOSITIONED_UNIT,
  LOCKED_EDIT,
  UNLOCKED_EDIT,
  LOCKED_POSITION,
  UNLOCKED_POSITION,
} from "./types";

// the handler we use to wrap all requests to the api
const createTimeoutHandler = (dispatch, timeout = 5000) => {
  let interval;
  let elapsed = 0;

  const timeoutWatcher = (func) => {
    // dispatch({
    //   type: RESET_REQUEST_TIMEOUT,
    // });

    // make the request
    func();

    // check that the request is still active after some duration
    interval = setInterval(() => {
      elapsed += 1000;

      if (elapsed >= timeout) {
        console.error("request timed out", func);
        dispatch({
          type: REQUEST_TIMEOUT,
        });
        clearInterval(interval);
      }
    }, 1000);
  };

  // when the request completes, clear the interval
  const timeoutEnd = (func) => {
    clearInterval(interval);
  };

  return [timeoutWatcher, timeoutEnd];
};

const isError = (response) => {
  return Object.keys(response).includes("error");
};

const handleError = (dispatch, response) => {
  const error_stamp = response.error;
  switch (error_stamp) {
    case NICKNAME_EXISTS: {
      // user error, tell them to try another
      dispatch({
        type: TAKEN_NICKNAME,
      });
      break;
    }
    case USER_ID_EXISTS: {
      // user error, tell them to try another
      dispatch({
        type: TAKEN_USER_ID,
      });
      break;
    }
    case BAD_EDIT_TRY: {
      // user error, probably rare concurrency issue
      dispatch({
        type: EDIT_UNABLED,
      });
      break;
    }
    case FAILED_EDIT_ACQUIRE: {
      // user error, probably rare concurrency issue
      dispatch({
        type: EDIT_UNABLED,
      });
      break;
    }
    case BAD_POSITION: {
      // user error, maybe concurrency issue or system issue
      dispatch({
        type: MOVE_UNABLED,
      });
      break;
    }
    case BAD_POSITION_TRY: {
      // user error, probably rare concurrency issue
      dispatch({
        type: MOVE_UNABLED,
      });
      break;
    }
    case FAILED_POSITION_ACQUIRE: {
      // user error, probably rare concurrency issue
      dispatch({
        type: MOVE_UNABLED,
      });
      break;
    }
    case BAD_PARENT: {
      // user error, move is invalid
      dispatch({
        type: BAD_TARGET,
      });
      break;
    }
    default: {
      /* 
      These errors indicate there is something wrong with the system:
      * BAD_DISCUSSION_ID,
      * BAD_USER_ID,
      * BAD_UNIT_ID,
      * INVALID_USER_SESSION,
      * BAD_REQUEST,
      * BAD_RESPONSE,
      */
      dispatch({
        type: SYSTEM_ERROR,
      });
    }
  }
};

const handleLoadUser = (dispatch, discussionId, userId) => {
  dispatch({
    type: LOAD_USER,
  });

  const data = {};

  const [startRequest, endRequest] = createTimeoutHandler(dispatch);

  startRequest(() =>
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
        dispatch({
          type: LOAD_USER_FULFILLED,
          payload: {
            icons: cursors,
            currentUnit: response.current_unit,
            timeline: timeline,
            chatHistory: response.chat_history || [],
            chatMapAdd: chatMeta,
            docMapAdd: docMeta,
          },
        });
      }
    })
  );
};

const handleJoinUser = (dispatch, discussionId, userId) => {
  dispatch({
    type: JOIN_USER,
  });

  const data = {
    discussion_id: discussionId,
    user_id: userId,
  };

  const [startRequest, endRequest] = createTimeoutHandler(dispatch);

  startRequest(() =>
    socket.emit("join", data, (res) => {
      endRequest();
      const response = JSON.parse(res);
      if (isError(response)) {
        handleError(dispatch, response);
      } else {
        dispatch({
          type: JOIN_USER_FULFILLED,
          payload: {
            discussionId: discussionId,
            userId: userId,
          },
        });
        handleLoadUser(dispatch);
      }
    })
  );
};

const enterUser = (discussionId) => {
  return (dispatch) => {
    const data = {
      discussion_id: discussionId,
    };

    const [startRequest, endRequest] = createTimeoutHandler(dispatch);

    startRequest(() =>
      socket.emit("test_connect", data, (res) => {
        endRequest();

        const response = JSON.parse(res);
        console.log("test_connect", response);
        if (isError(response)) {
          const error_stamp = response.error;
          switch (error_stamp) {
            case BAD_DISCUSSION_ID: {
              dispatch({
                type: INVALID_DISCUSSION,
              });
              break;
            }
            default: {
              dispatch({
                type: SYSTEM_ERROR,
              });
            }
          }
        } else {
          const userId = getValue(discussionId);
          if (userId === null) {
            dispatch({
              type: CREATE_NICKNAME,
            });
          } else {
            handleJoinUser(dispatch, discussionId, userId);
          }
        }
      })
    );
  };
};

const createUser = (discussionId, nickname) => {
  return (dispatch) => {
    dispatch({
      type: CREATE_USER,
    });

    const data = {
      discussion_id: discussionId,
      nickname: nickname,
    };
    const [startRequest, endRequest] = createTimeoutHandler(dispatch);

    startRequest(() =>
      socket.emit("create_user", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: CREATE_USER_FULFILLED,
          });

          // set the value in localStorage
          const userId = response.user_id;
          setValue(discussionId, userId);

          handleJoinUser(dispatch, discussionId, userId);
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

const getPage = (unitId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    dispatch({
      type: LOAD_UNIT_PAGE,
    });

    const [startRequest, endRequest] = createTimeoutHandler(dispatch);

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
            type: LOAD_UNIT_PAGE_FULFILLED,
            ancestors: response.ancestors,
            currentUnit: response.cursor.unit_id,
            timelineEntry: timelineEntry,
            children: children,
            backlinks: backlinks,
            docMeta: docMeta,
          });
        }
      })
    );
  };
};

const createPost = (pith) => {
  return (dispatch) => {
    const data = {
      pith: pith,
    };

    // report to UI the attempt
    dispatch({
      type: CREATE_POST,
      payload: {
        pith: pith,
      },
    });
    const [startRequest, endRequest] = createTimeoutHandler(dispatch);

    startRequest(() =>
      socket.emit("post", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          dispatch({
            type: CREATE_POST_FULFILLED,
          });
          // we should now expect to receive something through our subscription
        }
      })
    );
  };
};

const subscribeChat = () => {
  return (dispatch) => {
    socket.on("created_post", (res) => {
      const response = JSON.parse(res);
      const chatMeta = unpackChatMeta(response.chat_meta);
      const docMeta = unpackDocMeta(response.doc_meta);
      dispatch({
        type: CREATED_POST,
        payload: {
          unitId: response.unit_id,
          chatMapAdd: chatMeta,
          docMapAdd: docMeta,
        },
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

    const [startRequest, endRequest] = createTimeoutHandler(dispatch);

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

    const [startRequest, endRequest] = createTimeoutHandler(dispatch);

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
            type: SEARCH_FULFILLED,
            chatResults: response.chat_units,
            docResults: response.doc_units,
            chatMapAdd: chatMeta,
            docMapAdd: docMeta,
          });
        }
      })
    );
  };
};

const sendToDoc = (query) => {
  return (dispatch) => {
    const data = {
      query: query,
    };

    dispatch({
      type: SEND_TO_DOC,
    });

    const [startRequest, endRequest] = createTimeoutHandler(dispatch);

    startRequest(() =>
      socket.emit("send_to_doc", data, (res) => {
        endRequest();
        const response = JSON.parse(res);
        if (isError(response)) {
          handleError(dispatch, response);
        } else {
          console.log("DONE send_to_doc");
          dispatch({
            type: SEND_TO_DOC_FULFILLED,
          });
        }
      })
    );
  };
};

export {
  enterUser,
  createUser,
  getPage,
  createPost,
  getContext,
  search,
  sendToDoc,
  /*
  addUnit,
  hideUnit,
  unhideUnit,
  selectUnit,
  deselectUnit,
  moveUnits,
  requestEdit,
  deeditUnit,
  editUnit,
*/
  subscribeUsers,
  subscribeChat,
  /*
  subscribeAddedUnit,
  subscribeEditedUnit,
  subscribeAddedBacklinks,
  subscribeRemovedBacklinks,
  subscribeHidUnit,
  subscribeUnhidUnit,
  subscribeRepositionedUnit,
  subscribeLockedEdit,
  subscribeUnlockedEdit,
  subscribeLockedPosition,
  subscribeUnlockedPosition,
*/
};
