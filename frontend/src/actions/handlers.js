import { unpackChatMeta, unpackDocMeta } from "./utils";
import {
  SET_CURSOR,
  LEFT_USER,
  CREATED_POST,
  DOC_MAP,
  CHAT_MAP,
} from "../reducers/types";

const handleDocMeta = (response, dispatch) => {
  const docMeta = unpackDocMeta(response);
  dispatch({
    type: DOC_MAP,
    payload: {
      docMapAdd: docMeta,
    },
  });
};

const handleChatMeta = (response, dispatch) => {
  const chatMeta = unpackChatMeta(response);
  dispatch({
    type: CHAT_MAP,
    payload: {
      chatMapAdd: chatMeta,
    },
  });
};

const handleSetCursor = (response, dispatch) => {
  dispatch({
    type: SET_CURSOR,
    payload: {
      userId: response.user_id,
      icon: {
        nickname: response.nickname,
        unitId: response.cursor.unit_id,
      },
    },
  });
};

const handleLeftUser = (response, dispatch) => {
  dispatch({
    type: LEFT_USER,
    payload: {
      userId: response.user_id,
    },
  });
};

const handleCreatedPost = (response, dispatch) => {
  dispatch({
    type: CREATED_POST,
    payload: {
      unitId: response.unit_id,
    },
  });
};

const handleJoin = (shared, dispatch) => {
  handleSetCursor(shared.set_cursor, dispatch);
};
const handleLeave = (shared, dispatch) => {
  handleLeftUser(shared.left_user, dispatch);
};
const handleLoadUnitPage = (shared, dispatch) => {
  handleSetCursor(shared.set_cursor, dispatch);
};
const handlePost = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
  handleChatMeta(shared.chat_meta, dispatch);
  handleCreatedPost(shared.created_post, dispatch);
};
const handleSendToDoc = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
  handleChatMeta(shared.chat_meta, dispatch);
};
const handleHideUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
};
const handleUnhideUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
};
const handleAddUnit = (shared, dispatch) => {
  // no need to address added_unit
  handleDocMeta(shared.doc_meta, dispatch);
  handleChatMeta(shared.chat_meta, dispatch);
};
const handleSelectUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
};
const handleDeselectUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
};
const handleMoveUnits = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
};
const handleRequestToEdit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
};
const handleDeeditUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
};
const handleEditUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
  handleChatMeta(shared.chat_meta, dispatch);
};

export {
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
};
