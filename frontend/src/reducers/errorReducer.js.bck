import { ERROR_BAD_PSEUDONYM } from "../actions/types";

const errorReducer = (
	state = {
		discussion: {
			badPseudonym: false,
		},
	},
	action
) => {
	switch (action.type) {
		case ERROR_BAD_PSEUDONYM: {
			return { ...state, discussion: { badPseudonym: true } };
		}
		default: {
			return { ...state };
		}
	}
};

export default errorReducer;
