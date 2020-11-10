import {
  POPULATE_DISCUSSIONS,
  ADD_DISCUSSION,
} from "../reducer/types";

const defaultState = {
  discussions : [],
}

const boardReducer = (state = defaultState, action) => {
  switch (action.type) {
    case POPULATE_DISCUSSIONS: {
      return {
        ...state,
        discussions: action.payload.arr,
      };
      break;
    }
    case ADD_DISCUSSION: {
      const discussions = {...state.discussions};
      discussions.push(action.payload.add);
      return {
        ...state,
        discussions: discussions,
      };
      break;
    }
    default: {

    }
  }
}

export default boardReducer;
