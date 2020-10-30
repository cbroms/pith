import { socket } from "./socket";
import { getValue, setValue } from "../api/local";
import { unpackChatMeta, unpackDocMeta } from "./utils";

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
  // error events
  SYSTEM_ERROR,
  INVALID_DISCUSSION,
  TAKEN_NICKNAME,
  TAKEN_USER_ID,
  MOVE_UNABLED,
  EDIT_UNABLED,
  BAD_TARGET,
  // create user events
  CREATE_NICKNAME,
  CREATE_USER,
  CREATE_USER_FULFILLED,
  // join user events
  JOIN_USER,
  JOIN_USER_FULFILLED,
  JOINED_USER,
  // create post events
  CREATE_POST,
  CREATE_POST_FULFILLED,
  CREATED_POST,
} from "./types";

let isError = (response) => {
  return Object.keys(response).includes("error");
}

let handleError = (dispatch, response) => {
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
}

let handleJoinUser = (dispatch, discussionId, userId) => {
  dispatch({
    type: JOIN_USER,
  });

  const data = {
    discussion_id: discussionId,
    user_id: userId,
  };
  // backend acknowledged we sent request
  socket.emit("join", data, (res) => {
    const response = JSON.parse(res);
    if (isError(response)) {
      handleError(dispatch, response);
    }
    else {
      dispatch({
        type: JOIN_USER_FULFILLED,
        payload: {
          discussionId: discussionId,
          userId: userId,
        },
      });
    }
  });
};

const enterUser = (discussionId) => {
  return (dispatch) => {
    const data = {
      discussion_id: discussionId,
    };
    socket.emit("test_connect", data, (res) => {
      console.log("test_connect", res);
      const response = JSON.parse(res);
      if (isError(response)) {
        const error_stamp = response.error;
        switch (error_stamp) {
          case BAD_DISCUSSION_ID: {
            dispatch({
              type: INVALID_DISCUSSION,
            });
          }
          default: {
            dispatch({
              type: SYSTEM_ERROR,
            });
          }
        }
      }
      else {
        const userId = getValue(discussionId);
        if (userId === null) {
          dispatch({
            type: CREATE_NICKNAME,
          });
        } else {
          handleJoinUser(dispatch, discussionId, userId);
        }
      }
    });
  }
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
    // backend acknowledged we sent request
    socket.emit("create_user", data, (res) => {
      const response = JSON.parse(res);
      if (isError(response)) {
        handleError(dispatch, response);
      }
      else {
        dispatch({
          type: CREATE_USER_FULFILLED,
        });

        // set the value in localStorage
        const userId = response.user_id;
        setValue(discussionId, userId);

        handleJoinUser(dispatch, discussionId, userId);
      }
    });
  };
};

const subscribeUsers = () => {
  return (dispatch) => {
    socket.on("joined_user", (res) => {
      const response = JSON.parse(res);
      // TODO case on result
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
    });
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
    // backend acknowledged we sent request
    socket.emit("post", data, (res) => {
      const response = JSON.parse(res);
      if (isError(response)) {
        handleError(dispatch, response);
      }
      else {
        dispatch({
          type: CREATE_POST_FULFILLED,
        });
        // we should now expect to receive something through our subscription
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

export { enterUser, createUser, subscribeUsers, createPost, subscribeChat };
