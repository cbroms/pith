import {
	CREATE_USER,
	CREATE_USER_FULFILLED,
	CLEAR_USER,
} from "../actions/types";

const defaultState = {
	id: null,
	connecting: false,
	connected: false,
};
const userReducer = (state = defaultState, action) => {
	switch (action.type) {
		case CREATE_USER: {
			return { ...state, connecting: true };
		}
		case CREATE_USER_FULFILLED: {
			return {
				...state,
				connecting: false,
				connected: true,
				id: action.payload,
			};
		}
		case CLEAR_USER: {
			return { ...defaultState };
		}
		default: {
			return { ...state };
		}
	}
};

export default userReducer;
