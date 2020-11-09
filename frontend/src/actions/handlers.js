import {
  unpackChatMeta,
  unpackDocMeta,
} from "./utils";
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
}

const handleChatMeta = (response, dispatch) => {
	const chatMeta = unpackChatMeta(response);
	dispatch({
		type: CHAT_MAP,
		payload: {
			chatMapAdd: chatMeta,
		}
  });
}

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


handleJoin = (shared, dispatch) => {
  handleSetUser(shared.set_cursor, dispatch);
}
handleLeave = (shared, dispatch) => {
  handleLeftUser(shared.left_user, dispatch);
}
handleLoadUnitPage = (shared) => {
  handleSetCursor(shared.set_cursor, dispatch);
}
handlePost = (shared, dispatch) => {
	handleCreatedPost(shared.created_post, dispatch);
  handleDocMeta(shared.doc_meta, dispatch);
  handleChatMeta(shared.chat_meta, dispatch);
}
handleSendToDoc = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
  handleChatMeta(shared.chat_meta, dispatch);
}
handleHideUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
}
handleUnhideUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
}
handleAddUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
  handleChatMeta(shared.chat_meta, dispatch);
}
handleSelectUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
}
handleDeselectUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
}
handleMoveUnits = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
}
handleRequestToEdit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
}
handleDeeditUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
}
handleEditUnit = (shared, dispatch) => {
  handleDocMeta(shared.doc_meta, dispatch);
  handleChatMeta(shared.chat_meta, dispatch);
}
