import { applyMiddleware, createStore } from "redux";

import thunk from "redux-thunk";

import reducer from "./reducers";

const middlewares = [];

// add the logger middleware if we're in development only
if (process.env.NODE_ENV === `development`) {
	const { createLogger } = require(`redux-logger`);

	// set all actions as collapsed
	const logger = createLogger({
		collapsed: (getState, action) => true,
	});

	middlewares.push(logger);
}

middlewares.push(thunk);

const middleware = applyMiddleware(...middlewares);

export default createStore(reducer, middleware);
