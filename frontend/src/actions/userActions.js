import { v4 as uuidv4 } from "uuid";

import { socket } from "./socket";
import { getValue, setValue } from "../api/local";

import { CREATE_USER, CREATE_USER_FULFILLED, CLEAR_USER } from "./types";

const registerUser = () => {
	// try and get the session ID from localstorage. We're using this to persist a
	// user's session when they close the page-- when they reopen they shouldn't have
	// to rejoin a discussion by choosing a new name.
	let id = getValue("sessionID");
	if (id === null) {
		id = btoa(uuidv4());
		setValue("sessionID", id);
	}
	const data = { user_id: id };
	// send the ID to the server
	return (dispatch) => {
		dispatch({ type: CREATE_USER });
		socket.emit("create_user", data, (data) => {
			dispatch({ type: CREATE_USER_FULFILLED, payload: id });
		});
	};
};

const clearUser = () => {
	return (dispatch) => {
		dispatch({ type: CLEAR_USER });
	};
};

export { registerUser, clearUser };
