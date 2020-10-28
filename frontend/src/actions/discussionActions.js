import { socket } from "./socket";
import { getValue, setValue } from "../api/local";
import { unpackChatMeta, unpackDocMeta } from "./utils";

import {
  CREATE_NICKNAME,
  CREATE_USER,
  JOIN_USER,
  CREATE_USER_FULFILLED,
  JOIN_USER_FULFILLED,
  JOINED_USER,
  CREATE_POST,
  CREATE_POST_FULFILLED,
  CREATED_POST,
} from "./types";

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
      dispatch({
        type: JOIN_USER_FULFILLED,
        payload: {
          discussionId: discussionId,
          userId: userId,
        },
      });
    });
}

const enterUser = (discussionId) => {
  return (dispatch) => {
    // TODO check if key discussionId in local storage
    // if so, get value userId
    const userId = null;

    if (userId === null) {
      dispatch({
        type: CREATE_NICKNAME,
      });
    } else {
      handleJoinUser(dispatch, discussionId, userId);
    }
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
    // backend acknowledged we sent request
    socket.emit("create_user", data, (res) => {
      // TODO case on result
      dispatch({
        type: CREATE_USER_FULFILLED,
      });
      const response = JSON.parse(res);

      const userId = response.user_id;
      // TODO store in local storage

      handleJoinUser(dispatch, discussionId, userId);
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
      dispatch({
        type: CREATE_POST_FULFILLED,
      });
    });
  };
};

const subscribeChat = () => {
  return (dispatch) => {
    socket.on("created_post", (res) => {
      // TODO case on result
      const response = JSON.parse(response);
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
