import { applyMiddleware, createStore } from "redux";

import { createLogger } from "redux-logger";
import thunk from "redux-thunk";

import reducer from "./reducers";
import { LOAD_DISCUSSION_PROGRESS } from "./actions/types";

const logger = createLogger({
	collapsed: (getState, action) => action.type === LOAD_DISCUSSION_PROGRESS,
});
const middleware = applyMiddleware(thunk, logger);

export default createStore(reducer, middleware);
