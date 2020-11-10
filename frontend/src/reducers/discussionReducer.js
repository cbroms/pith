import {
  JOIN_USER_FULFILLED,
  LOAD_UNIT_PAGE_FULFILLED,
  SEARCH_FULFILLED,
  CHAT_MAP,
  DOC_MAP,
  SET_CURSOR,
  CREATED_POST,
  LEFT_USER,
  SYSTEM_ERROR,
  COMPLETE_REQUEST,
  REQUEST_TIMEOUT,
  RESET_REQUEST_TIMEOUT,
} from "./types";

const defaultState = {
  systemError: false,
  requestTimeout: false,
  completedRequests: {},
  // valid state
  discussionId: null,
  userId: null,
  nickname: null,
  chatMap: {},
  docMap: {},
  posts: [],
  currentUnit: "",
  ancestors: [],
  icons: [],
  timeline: [],
  searchResults: {
    chat: null,
    doc: null,
  },
};

const discussionReducer = (state = defaultState, action) => {
  switch (action.type) {
    case JOIN_USER_FULFILLED: {
      return {
        ...state,
        discussionId: action.payload.discussionId,
        userId: action.payload.userId,
        nickname: action.payload.nickname,
        icons: action.payload.icons,
        currentUnit: action.payload.currentUnit,
        timeline: action.payload.timeline,
        posts: action.payload.chatHistory,
      };
      break;
    }
    case LOAD_UNIT_PAGE_FULFILLED: {
      const timeline = [...state.timeline];
      timeline.push(action.payload.timelineEntry);
      return {
        ...state,
        requestTimeout: false,
        ancestors: action.payload.ancestors,
        currentUnit: action.payload.currentUnit,
        timeline: timeline,
        documentTree: action.payload.children,
        backlinkTree: action.payload.backlinks,
      };
      break;
    }
    case SEARCH_FULFILLED: {
      const searchResults = { ...state.searchResults };
      searchResults.chat = action.payload.chatResults;
      searchResults.doc = action.payload.docResults;
      return {
        ...state,
        requestTimeout: false,
        searchResults: searchResults,
      };
      break;
    }
    case CHAT_MAP: {
      const chatMap = { ...state.chatMap };
      return {
        ...state,
        chatMap: Object.assign(chatMap, action.payload.chatMapAdd),
      };
      break;
    }
    case DOC_MAP: {
      const docMap = { ...state.docMap };
      return {
        ...state,
        docMap: Object.assign(docMap, action.payload.docMapAdd),
      };
      break;
    }
    case SET_CURSOR: {
      const icons = { ...state.icons };
      icons[action.payload.userId] = action.payload.icon;
      return {
        ...state,
        icons: icons,
      };
      break;
    }
    case LEFT_USER: {
      const icons = { ...state.icons };
      delete icons[action.payload.userId];
      return {
        ...state,
        icons: icons,
      };
      break;
    }
    case CREATED_POST: {
      const posts = [...state.posts];
      posts.push(action.payload.unitId);
      return {
        ...state,
        posts: posts,
      };
      break;
    }
    case SYSTEM_ERROR: {
      return {
        ...state,
        systemError: true,
      };
      break;
    }
    case COMPLETE_REQUEST: {
      const completedRequests = { ...state.completedRequests };
      completedRequests[action.payload.id] = action.payload.value;
      return {
        ...state,
        completedRequests: completedRequests,
      };
      break;
    }
    case REQUEST_TIMEOUT: {
      return {
        ...state,
        requestTimeout: true,
      };
      break;
    }
    case RESET_REQUEST_TIMEOUT: {
      return {
        ...state,
        requestTimeout: false,
      };
      break;
    }
    default: {
      return { ...state };
    }
  }
};

export default discussionReducer;
