import {
  SYSTEM_ERROR,
  INVALID_DISCUSSION,
  TAKEN_NICKNAME,
  TAKEN_USER_ID,
  MOVE_UNABLED,
  EDIT_UNABLED,
  BAD_TARGET,
  CREATE_NICKNAME,
  CREATE_USER,
  JOIN_USER,
  CREATE_USER_FULFILLED,
  JOIN_USER_FULFILLED,
  JOINED_USER,
  CREATE_POST,
  CREATE_POST_FULFILLED,
  CREATED_POST,
} from "../actions/types";

const defaultState = {
  systemError: false,
  userError: {
    invalidDiscussion: false,
    createUser: {
      takenNickname: false,
      takenUserId: false,
    },
    concurrency: {
      moveUnabled: false,
      editUnabled: false,
      badTarget: false, 
    },
  },
  events: {
    createNickname: false,
    joined: false,
    createUser: {
      pending: false,
    },
    joinUser: {
      pending: false,
    },
    post: {
      pending: false,
      content: {
        pith: "",
      },
    },
  },
  discussionId: null,
  userId: null,
  nickname: null,
  chatMap: {},
  docMap: {},
  posts: [],
  currentUnit: "",
  ancestors: [],
  documentTree: [],
  backlinkTree: [],
  icons: [],
  timeline: [],
  searchResults: [],
  currentContext: null,
};

const discussionReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SYSTEM_ERROR: {
      return {
        ...state,
        systemError: true,
      };
    }
    case INVALID_DISCUSSION: {
      const userError = { ...state.userError };
      userError.invalidDiscussion = true;
      return {
        ...state,
        userError: userError,
      }
    }
    case TAKEN_NICKNAME: {
      const userError = { ...state.userError };
      userError.createUser.takenNickname = true;
      return {
        ...state,
        userError: userError,
      }
    }
    case TAKEN_USER_ID: {
      const userError = { ...state.userError };
      userError.createUser.takenUserId = true;
      return {
        ...state,
        userError: userError,
      }
    }
    case MOVE_UNABLED: {
      const userError = { ...state.userError };
      userError.concurrency.moveUnabled = true;
      return {
        ...state,
        userError: userError,
      }
    }
    case EDIT_UNABLED: {
      const userError = { ...state.userError };
      userError.concurrency.editUnabled = true;
      return {
        ...state,
        userError: userError,
      }
    }
    case BAD_TARGET: {
      const userError = { ...state.userError };
      userError.concurrency.badTarget = true;
      return {
        ...state,
        userError: userError,
      }
    }
    case CREATE_NICKNAME: {
      const events = { ...state.events };
      events.createNickname = true;
      return {
        ...state,
        events: events,
      };
    }
    case CREATE_USER: {
      const events = { ...state.events };
      events.createUser.pending = true;
      return {
        ...state,
        events: events,
      };
    }
    case JOIN_USER: {
      const events = { ...state.events };
      events.joinUser.pending = true;
      return {
        ...state,
        events: events,
      };
    }
    case CREATE_USER_FULFILLED: {
      const events = { ...state.events };
      events.createUser = { ...defaultState.events.createUser };
      return {
        ...state,
        events: events,
      };
    }
    case JOIN_USER_FULFILLED: {
      const events = { ...state.events };
      events.joinUser = { ...defaultState.events.joinUser };
      events.joined = true;
      return {
        ...state,
        events: events,
        discussionId: action.payload.discussionId,
        userId: action.payload.userId,
        nickname: action.payload.nickname,
      };
    }
    case JOINED_USER: {
      const icons = { ...state.icons };
      icons.push(action.payload.icon);
      return {
        ...state,
        icons: icons,
      };
    }
    case CREATE_POST: {
      const events = { ...state.events };
      events.post.pending = true;
      events.post.content.pith = action.payload.pith;
      return {
        ...state,
        events: events,
      };
    }
    case CREATE_POST_FULFILLED: {
      const events = { ...state.events };
      events.post = { ...defaultState.events.post };
      return {
        ...state,
        events: events,
      };
    }
    case CREATED_POST: {
      const posts = [...state.posts];
      posts.push(action.payload.unitId);
      const chatMap = { ...state.chatMap };
      const docMap = { ...state.docMap };
      return {
        ...state,
        posts: posts,
        chatMap: Object.assign(chatMap, action.payload.chatMapAdd),
        docMap: Object.assign(docMap, action.payload.docMapAdd),
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default discussionReducer;
