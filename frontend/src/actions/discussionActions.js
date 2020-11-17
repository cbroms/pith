import { socket } from "./socket";
import { getValue, setValue } from "../api/local";
import { cleanUpRequest, createRequestWrapper } from "./queue";

import {
  getStatus,
  unpackCursors,
  unpackChildren,
  unpackBacklinks,
  unpackTimelineEntry,
  unpackTimeline,
  unpackContext,
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
  GENERIC_ERROR,
  INVALID_DISCUSSION,
  NO_USER_ID,
  TAKEN_NICKNAME,
  TAKEN_USER_ID,
  MOVE_DISABLED,
  EDIT_DISABLED,
  BAD_TARGET,
} from "../utils/errors";

import {
  handleDocMeta,
  handleChatMeta,
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
  handleMoveUnits,
  handleRequestToEdit,
  handleDeeditUnit,
  handleEditUnit,
} from "./handlers";

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
  MOVE_UNIT,
  MOVE_UNITS,
  REQUEST_EDIT_UNIT,
  DEEDIT_UNIT,
  EDIT_UNIT,
} from "./types";

import {
  SYSTEM_ERROR,
  JOIN_USER_FULFILLED,
  LOAD_UNIT_PAGE_FULFILLED,
  SEARCH_FULFILLED,
} from "../reducers/types";

const joinUser = (discussionId, requestId) => {
  return (dispatch) => {
    // we assume join user to be called only when the userId is populated
    const userId = getValue(discussionId);

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

        if (statusCode === null) {
          // success
          handleJoin(response.shared, dispatch);
          handleDocMeta(response.doc_meta, dispatch);
          handleChatMeta(response.chat_meta, dispatch);

          const timeline = unpackTimeline(response.timeline);
          const icons = unpackCursors(response.cursors);
          dispatch({
            type: JOIN_USER_FULFILLED,
            payload: {
              discussionId: discussionId,
              userId: userId,
              nickname: response.nickname,
              icons: icons,
              currentUnit: response.current_unit,
              timeline: timeline,
              chatHistory: response.chat_history || [],
            },
          });
        }
        endRequest(statusCode);
      });
    });
  };
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
        let statusCode = getStatus(response, dispatch, {
          [BAD_DISCUSSION_ID]: INVALID_DISCUSSION,
        });

        if (statusCode === null) {
          // success
          const userId = getValue(discussionId);
          if (userId === null) {
            statusCode = NO_USER_ID; // need to call createUser
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
        const statusCode = getStatus(response, dispatch, {
          [NICKNAME_EXISTS]: TAKEN_NICKNAME,
          [USER_ID_EXISTS]: TAKEN_USER_ID,
        });
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
          handleLoadUnitPage(response.shared, dispatch);
          const children = unpackChildren(response.children);
          const backlinks = unpackBacklinks(response.backlinks);
          const timelineEntry = unpackTimelineEntry(response.timeline_entry);
          handleDocMeta(response.doc_meta, dispatch);
          dispatch({
            type: LOAD_UNIT_PAGE_FULFILLED,
            payload: {
              ancestors: response.ancestors,
              currentUnit: unitId,
              timelineEntry: timelineEntry,
              children: children,
              backlinks: backlinks,
            },
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
          console.log("response", response);
          handlePost(response.shared, dispatch);
          console.log("handled");
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
          handleDocMeta(response.doc_meta, dispatch);
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
          handleDocMeta(response.doc_meta, dispatch);
          handleChatMeta(response.chat_meta, dispatch);
          dispatch({
            type: SEARCH_FULFILLED,
            payload: {
              chatResults: response.chat_units,
              docResults: response.doc_units,
            },
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
        console.log("send_to_doc received");
        const response = JSON.parse(res);
        console.log(response);
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
        const statusCode = getStatus(response, dispatch, {
          [BAD_EDIT_TRY]: EDIT_DISABLED,
        });
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
        const statusCode = getStatus(response, dispatch, {
          [FAILED_POSITION_ACQUIRE]: MOVE_DISABLED,
        });
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
        const statusCode = getStatus(response, dispatch, {
          [BAD_POSITION_TRY]: MOVE_DISABLED,
        });
        if (statusCode === null) {
          handleDeselectUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

// TODO moveUnit for drag-and-drop or keyboard
const moveUnit = (unitId, parentUnit, position, requestId) => {
  return (dispatch) => {
    const data1 = {
      unit_id: unitId,
    };
    const data2 = {
      units: [unitId],
      parent: parentUnit,
      position: position,
    };

    const [startRequest, endRequest] = createRequestWrapper(
      MOVE_UNIT,
      dispatch,
      requestId
    );

    startRequest(() => {
      socket.emit("select_unit", data1, (res) => {
        const response = JSON.parse(res);
        const statusCode = getStatus(response, dispatch, {
          [FAILED_POSITION_ACQUIRE]: MOVE_DISABLED,
        });
        if (statusCode === null) {
          handleSelectUnit(response.shared, dispatch);
          // next emit
          socket.emit("move_units", data2, (res) => {
            const response = JSON.parse(res);
            const statusCode = getStatus(response, dispatch, {
              [BAD_POSITION_TRY]: MOVE_DISABLED,
              [BAD_PARENT]: BAD_TARGET,
            });
            if (statusCode === null) {
              handleMoveUnits(response.shared, dispatch);
            }
            endRequest(statusCode);
          });
        } else {
          endRequest(statusCode); // end early
        }
      });
    });
  };
};

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
        const statusCode = getStatus(response, dispatch, {
          [BAD_POSITION_TRY]: MOVE_DISABLED,
          [BAD_PARENT]: BAD_TARGET,
        });
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
        const statusCode = getStatus(response, dispatch, {
          [FAILED_EDIT_ACQUIRE]: EDIT_DISABLED,
        });
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
        const statusCode = getStatus(response, dispatch, {
          [BAD_EDIT_TRY]: EDIT_DISABLED,
        });
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
        const statusCode = getStatus(response, dispatch, {
          [BAD_EDIT_TRY]: EDIT_DISABLED,
        });
        if (statusCode === null) {
          handleEditUnit(response.shared, dispatch);
        }
        endRequest(statusCode);
      })
    );
  };
};

const subscribeChat = () => {
  return (dispatch) => {
    socket.on("post", (res) => {
      console.log("post");
      const response = JSON.parse(res);
      handlePost(response, dispatch);
    });
  };
};

const subscribeDocument = () => {
  return (dispatch) => {
    socket.on("join", (res) => {
      const response = JSON.parse(res);
      handleJoin(response, dispatch);
    });

    socket.on("leave", (res) => {
      const response = JSON.parse(res);
      handleLeave(response, dispatch);
    });

    socket.on("load_unit_page", (res) => {
      const response = JSON.parse(res);
      handleLoadUnitPage(response, dispatch);
    });

    socket.on("send_to_doc", (res) => {
      console.log("send_to_doc");
      const response = JSON.parse(res);
      handleSendToDoc(response, dispatch);
    });

    socket.on("hide_unit", (res) => {
      const response = JSON.parse(res);
      handleHideUnit(response, dispatch);
    });

    socket.on("unhide_unit", (res) => {
      const response = JSON.parse(res);
      handleUnhideUnit(response, dispatch);
    });

    socket.on("add_unit", (res) => {
      const response = JSON.parse(res);
      handleAddUnit(response, dispatch);
    });

    socket.on("select_unit", (res) => {
      const response = JSON.parse(res);
      handleSelectUnit(response, dispatch);
    });

    socket.on("deselect_unit", (res) => {
      const response = JSON.parse(res);
      handleDeselectUnit(response, dispatch);
    });

    socket.on("move_units", (res) => {
      const response = JSON.parse(res);
      handleMoveUnits(response, dispatch);
    });

    socket.on("request_to_edit", (res) => {
      const response = JSON.parse(res);
      handleRequestToEdit(response, dispatch);
    });

    socket.on("deedit_unit", (res) => {
      const response = JSON.parse(res);
      handleDeeditUnit(response, dispatch);
    });

    socket.on("edit_unit", (res) => {
      const response = JSON.parse(res);
      handleEditUnit(response, dispatch);
    });
  };
};

export {
  enterDiscussion,
  createUser,
  joinUser,
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
  subscribeChat,
  subscribeDocument,
};
