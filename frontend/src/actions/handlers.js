import {
  unpackChatMeta,
  unpackDocMeta,
} from "./utils";
import {
	SET_CURSOR,
  LEFT_USER,
  CREATED_POST,
  ADDED_UNIT,
  EDITED_UNIT,
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

const handleCreatedPost = (response, dispatch) => {
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
};

const handleAddedUnit = (response, dispatch) => {
// TODO
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
	/*
	dispatch({
		type: ADDED_UNIT,
		payload: {
			unitId: response.unit_id,
			parent: response.parent,
			position: response.position,
		},
	});
	*/
}

const handleEditedUnit = (response, dispatch) => {
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
}

const handleAddedBacklinks = (response, dispatch) => {
// TODO
	for (const entry in response) {
		/*
		dispatch({
			type: ADDED_BACKLINK,
			payload: {
				unitId: entry.unit_id,
				backlink: entry.backlink,
			},
		});
		*/
		const docMeta = unpackDocMeta(entry.doc_meta);
		dispatch({
			type: DOC_MAP,
			payload: {
				docMapAdd: docMeta,
			},
		});
	}
}

const handleRemovedBacklinks = (response, dispatch) => {
// TODO
	for (const entry in response) {
		/*
		dispatch({
			type: REMOVED_BACKLINK,
			payload: {
				unitId: entry.unit_id,
				backlink: entry.backlink,
			},
		});
		*/
		const docMeta = unpackDocMeta(entry.doc_meta);
		dispatch({
			type: DOC_MAP,
			payload: {
				docMapAdd: docMeta,
			},
		});
	}
}

const handleHidUnit = (response, dispatch) => {
// TODO
	const docMeta = unpackDocMeta(response.doc_meta);
	dispatch({
		type: DOC_MAP,
		payload: {
			docMapAdd: docMeta,
		},
	});
/*
	const state = getState();
	if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
		dispatch({
			type: HID_UNIT,
			payload: {
				unitId: response.unit_id,
			},
		});
	}
*/
});

const handleUnhidUnit = (response, dispatch) => {
// TODO
	const docMeta = unpackDocMeta(response.doc_meta);
	dispatch({
		type: DOC_MAP,
		payload: {
			docMapAdd: docMeta,
		},
	});
/*
	const state = getState();
	if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
		dispatch({
			type: HID_UNIT,
			payload: {
				unitId: response.unit_id,
			},
		});
	}
*/
});

const handleRepositionedUnit = (response, dispatch) => {
// TODO
	for (const entry in response) {
/*
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
*/
		const docMeta = unpackDocMeta(entry.doc_meta);
		dispatch({
			type: DOC_MAP,
			payload: {
				docMapAdd: docMeta,
			},
		});
	}
});

const handleLockedUnitEditable = (response, dispatch) => {
// TODO
	const docMeta = unpackDocMeta(response.doc_meta);
	dispatch({
		type: DOC_MAP,
		payload: {
			docMapAdd: docMeta,
		},
	});
/*
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
*/
});

const handleUnlockedUnitEditable = (response, dispatch) => {
	// TODO
	const docMeta = unpackDocMeta(response.doc_meta);
	dispatch({
		type: DOC_MAP,
		payload: {
			docMapAdd: docMeta,
		},
	});
/*
	const state = getState();
	if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
		dispatch({
			type: UNLOCKED_EDIT,
			payload: {
				unitId: response.unit_id,
			},
		});
	}
*/
});

const handleLockedUnitPosition = (response, dispatch) => {
	// TODO
	const docMeta = unpackDocMeta(response.doc_meta);
	dispatch({
		type: DOC_MAP,
		payload: {
			docMapAdd: docMeta,
		},
	});
/*
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
*/
});

const handleUnlockedUnitPosition = (response, dispatch) => {
	const docMeta = unpackDocMeta(response.doc_meta);
	dispatch({
		type: DOC_MAP,
		payload: {
			docMapAdd: docMeta,
		},
	});
/*
	// TODO
	const state = getState();
	if (Object.keys(state.discussion.docMap).includes(response.unit_id)) {
		dispatch({
			type: UNLOCKED_POSITION,
			payload: {
				unitId: response.unit_id,
			},
		});
	}
*/
});

handleJoin = (shared, dispatch) => {
  handleJoinedUser(shared.set_cursor, dispatch);
}
handleLeave = (shared, dispatch) => 
handleLoadUnitPage = (shared) => {
  handleSetCursor(shared.set_cursor, dispatch);
}
handlePost = (shared, dispatch) => {
	handleCreatedPost(shared.created_post, dispatch);
	handleAddedBacklinks(shared.added_backlinks, dispatch);
}
handleSendToDoc = (shared, dispatch) => {
	handleSendToDoc(shared.added_unit, dispatch);
	handleAddedBacklinks(shared.added_backlinks, dispatch);
}
handleHideUnit = (shared, dispatch) => {
	handleHidUnit(shared.hid_unit, dispatch);
	handleUnlockedUnitEditable(shared.unlocked_unit_editable, dispatch);	
}
handleUnhideUnit = (shared, dispatch) => {
	handleHidUnit(shared.unhid_unit, dispatch);
}
handleAddUnit = (shared, dispatch) => {
	handleSendToDoc(shared.added_unit, dispatch);
	handleAddedBacklinks(shared.added_backlinks, dispatch);
}
handleSelectUnit = (shared, dispatch) => {
	handleLockedUnitPosition(shared.locked_unit_position, dispatch);
}
handleDeselectUnit = (shared, dispatch) => {
	handleUnlockedUnitPosition(shared.unlocked_unit_position, dispatch);
}
handleMoveUnits = (shared, dispatch) => {
	handleRepositionedUnit(shared.repositioned_unit, dispatch);
	handleUnlockedUnitPosition(shared.unlocked_unit_position, dispatch);
}
handleRequestToEdit = (shared, dispatch) => {
	handleLockedUnitEditable(shared.locked_unit_editable, dispatch);	
}
handleDeeditUnit = (shared, dispatch) => {
	handleUnlockedUnitEditable(shared.unlocked_unit_editable, dispatch);	
}
handleEditUnit = (shared, dispatch) => {
	handleEditedUnit(shared.edited_unit, dispatch);
	handleUnlockedUnitEditable(shared.unlocked_unit_editable, dispatch);	
	handleRemovedBacklinks(shared.removed_backlinks, dispatch);
	handleAddedBacklinks(shared.added_backlinks, dispatch);
}
