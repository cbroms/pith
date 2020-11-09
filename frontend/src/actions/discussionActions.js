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
  handleJoin,
  handleLeave,
  handleLoadUnitPage,
  handlePost,
  handleSendToDoc,
  handleHideUnit,
  handleUnhideUnit,
  handleAddUnit,
  handleSelectUnit,
  handleDeselectUnit,
  handleRequestToEdit,
  handleDeeditUnit,
  handleEditUnit,
} from "./handlers";
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
  TEST_CONNECT_FULFILLED,
  CREATE_USER_FULFILLED,
  JOIN_USER_FULFILLED,
  LOAD_USER_FULFILLED,
  LOADED_USER,
  LOAD_UNIT_PAGE_FULFILLED,
  CREATE_POST_FULFILLED,
  GET_CONTEXT_FULFILLED,
  SEARCH_FULFILLED,
  SEND_TO_DOC_FULFILLED,
  ADD_UNIT_FULFILLED,
  HIDE_UNIT_FULFILLED,
  UNHIDE_UNIT_FULFILLED,
  SELECT_UNIT_FULFILLED,
  DESELECT_UNIT_FULFILLED,
  MOVE_UNITS_FULFILLED,
  REQUEST_EDIT_UNIT_FULFILLED,
  DEEDIT_UNIT_FULFILLED,
  EDIT_UNIT_FULFILLED,
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

const joinUser = (discussionId, userId, requestId) => {
  const data = {
    discussion_id: discussionId,
    user_id: userId,
  };

  const [startRequest, endRequest] = createRequestWrapper(
    JOIN_USER,
    dispatch,
    requestId
  );

	startRequest(() => {
    socket.emit("join", data, (res) => {
      const response = JSON.parse(res);
      const statusCode = getStatus(response, dispatch, {});

      if (statusCode === null) { // success 
        handleJoin(response.shared, dispatch);
        const chatMeta = unpackChatMeta(response.chat_meta);
        const docMeta = unpackDocMeta(response.doc_meta);
        const timeline = unpackTimeline(response.timeline);
        const cursors = unpackCursors(response.cursors);
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
          type: JOINED_USER,
          payload: {
            discussionId: discussionId,
            userId: userId,
            nickname: response.nickname, 
            icons: cursors,
            currentUnit: response.current_unit,
            timeline: timeline,
            chatHistory: response.chat_history || [],
          },
        });
      }
      endRequest(statusCode);
  });
};

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

    const [startRequest, endRequest] = createRequestWrapper(
      CREATE_USER,
      dispatch,
      requestId
    );

    startRequest(() => {
      socket.emit("create_user", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          // set the value in localStorage
          const userId = response.user_id;
          setValue(discussionId, userId);
        }

        endRequest(statusCode);
      });
    });
  };
};

const getPage = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      LOAD_UNIT_PAGE,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("load_unit_page", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleGetPage(response.shared, dispatch);
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
        endRequest(statusCode);
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
      CREATE_POST,
      dispatch,
      requestId
    );

    startRequest(() => {
      socket.emit("post", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleCreatePost(response.shared, dispatch);
        }
        endRequest(statusCode);
      });
    });
  };
};

const getContext = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      GET_CONTEXT, 
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("get_unit_context", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
					const docMeta = unpackDocMeta(response.doc_meta);
					dispatch({
						type: DOC_MAP,
						payload: {
							docMapAdd: docMeta,
						},
					});
					/*
          const context = unpackContext(response);
          dispatch({
            type: GET_CONTEXT_FULFILLED,
            context: context,
          });
					*/
        }
        endRequest(statusCode);
      })
    );
  };
};

const search = (query, requestId) => {
  return (dispatch) => {
    const data = {
      query: query,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      SEARCH,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("search", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
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
        endRequest(statusCode);
      })
    );
  };
};

const sendToDoc = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      SEND_TO_DOC,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("send_to_doc", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleSendToDoc(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const addUnit = (pith, parentUnit, position, requestId) => {
  return (dispatch) => {
    const data = {
      pith: pith,
      parent: parentUnit,
      position: position,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      ADD_UNIT, 
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("add_unit", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleAddUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const hideUnit = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      HIDE_UNIT,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("hide_unit", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleHideUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const unhideUnit = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      UNHIDE_UNIT,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("unhide_unit", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleUnhideUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const selectUnit = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      SELECT_UNIT,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("select_unit", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleSelectUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const deselectUnit = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      DESELECT_UNIT,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("deselect_unit", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleDeselectUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

// TODO moveUnit for drag-and-drop or keyboard

const moveUnits = (units, parentUnit, position, requestId) => {
  return (dispatch) => {
    const data = {
      units: units,
      parent: parentUnit,
      position: position,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      MOVE_UNITS,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("move_units", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleMoveUnits(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const requestEdit = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      REQUEST_EDIT_UNIT,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("request_to_edit", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleRequestToEdit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const deeditUnit = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      DEEDIT_UNIT,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("deedit_unit", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleDeeditUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const editUnit = (unitId, requestId) => {
  return (dispatch) => {
    const data = {
      unit_id: unitId,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      EDIT_UNIT,
      dispatch,
      requestId
    );

    startRequest(() =>
      socket.emit("edit_unit", data, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {});
        if (statusCode === null) {
          handleEditUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const subscribeJoin = () => {
  return (dispatch) => {
    socket.on("join", (res) => {
      const response = JSON.parse(res);
      handleJoin(response, dispatch);
    }
  }
}

const subscribeLeave = () => {
  return (dispatch) => {
    socket.on("leave", (res) => {
      const response = JSON.parse(res);
      handleLeave(response, dispatch);
    }
  }
}

const subscribeLoadUnitPage = () => {
  return (dispatch) => {
    socket.on("load_unit_page", (res) => {
      const response = JSON.parse(res);
      handleLoadUnitPage(response, dispatch);
    }
  }
}

const subscribePost = () => {
  return (dispatch) => {
    socket.on("post", (res) => {
      const response = JSON.parse(res);
      handlePost(response, dispatch);
    }
  }
}

const subscribeSendToDoc = () => {
  return (dispatch) => {
    socket.on("post", (res) => {
      const response = JSON.parse(res);
      handleSendToDoc(response, dispatch);
    }
  }
}

const subscribeHideUnit = () => {
  return (dispatch) => {
    socket.on("hide_unit", (res) => {
      const response = JSON.parse(res);
      handleHideUnit(response, dispatch);
    }
  }
}

const subscribeUnhideUnit = () => {
  return (dispatch) => {
    socket.on("unhide_unit", (res) => {
      const response = JSON.parse(res);
      handleUnhideUnit(response, dispatch);
    }
  }
}

const subscribeAddUnit = () => {
  return (dispatch) => {
    socket.on("add_unit", (res) => {
      const response = JSON.parse(res);
      handleAddUnit(response, dispatch);
    }
  }
}

const subscribeSelectUnit = () => {
  return (dispatch) => {
    socket.on("select_unit", (res) => {
      const response = JSON.parse(res);
      handleSelectUnit(response, dispatch);
    }
  }
}

const subscribeDeselectUnit = () => {
  return (dispatch) => {
    socket.on("deselect_unit", (res) => {
      const response = JSON.parse(res);
      handleDeelectUnit(response, dispatch);
    }
  }
}

const subscribeMoveUnits = () => {
  return (dispatch) => {
    socket.on("move_units", (res) => {
      const response = JSON.parse(res);
      handleMoveUnits(response, dispatch);
    }
  }
}

const subscribeRequestToEdit = () => {
  return (dispatch) => {
    socket.on("request_to_edit", (res) => {
      const response = JSON.parse(res);
      handleRequestToEdit(response, dispatch);
    }
  }
}

const subscribeDeeditUnit = () => {
  return (dispatch) => {
    socket.on("deedit_unit", (res) => {
      const response = JSON.parse(res);
      handleDeeditUnit(response, dispatch);
    }
  }
}

const subscribeEditUnit = () => {
  return (dispatch) => {
    socket.on("edit_unit", (res) => {
      const response = JSON.parse(res);
      handleEditUnit(response, dispatch);
    }
  }
}

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
  subscribeJoin,
  subscribeLeave,
  subscribeLoadUnitPage,
  subscribePost,
  subscribeSendToDoc,
  subscribeMoveCursor,
  subscribeHideUnit,
  subscribeUnhideUnit,
  subscribeAddUnit,
  subscribeSelectUnit,
  subscribeDeselectUnit,
  subscribeRequestToEdit,
  subscribeDeeditUnit,
  subscribeEditUnit,
};
