import { combineReducers } from "redux";

import board from "./boardReducer";
import discussion from "./discussionReducer";

export default combineReducers({
	board: board,
	discussion: discussion,
});
