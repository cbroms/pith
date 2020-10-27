import { applyMiddleware, createStore } from "redux";

import { createLogger } from "redux-logger";
import thunk from "redux-thunk";

import reducer from "./reducers";

const logger = createLogger();
const middleware = applyMiddleware(thunk, logger);

export default createStore(reducer, middleware);
