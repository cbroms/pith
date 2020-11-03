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
  LOAD_USER,
  LOAD_USER_FULFILLED,
  LOAD_UNIT_PAGE,
  LOAD_UNIT_PAGE_FULFILLED,
  CREATE_POST,
  CREATE_POST_FULFILLED,
  GET_CONTEXT,
  GET_CONTEXT_FULFILLED,
  SEARCH,
  SEARCH_FULFILLED,
  SEND_TO_DOC,
  SEND_TO_DOC_FULFILLED,
  ADD_UNIT,
  ADD_UNIT_FULFILLED,
  HIDE_UNIT,
  HIDE_UNIT_FULFILLED,
  UNHIDE_UNIT,
  UNHIDE_UNIT_FULFILLED,
  SELECT_UNIT,
  SELECT_UNIT_FULFILLED,
  DESELECT_UNIT,
  DESELECT_UNIT_FULFILLED,
  MOVE_UNIT,
  MOVE_UNIT_FULFILLED,
  REQUEST_EDIT_UNIT,
  REQUEST_EDIT_UNIT_FULFILLED,
  DEEDIT_UNIT,
  DEEDIT_UNIT_FULFILLED,
  EDIT_UNIT,
  EDIT_UNIT_FULFILLED,
  JOINED_USER,
  CREATED_POST,
  ADDED_UNIT,
  EDITED_UNIT,
  ADDED_BACKLINKS,
  REMOVED_BACKLINKS,
  HID_UNIT,
  UNHID_UNIT,
  REPOSITIONED_UNIT,
  LOCKED_EDIT,
  UNLOCKED_EDIT,
  LOCKED_POSITION,
  UNLOCKED_POSITION,
  RESET_REQUEST_TIMEOUT,
  REQUEST_TIMEOUT,
} from "../actions/types";

const defaultState = {
  systemError: false,
  requestTimeout: false,
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
    loadUser: {
      pending: false,
    },
    loadUnitPage: {
      pending: false,
    },
    post: {
      pending: false,
      content: {
        pith: "",
      },
    },
    getContext: {
      pending: false,
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
  searchResults: {
    chat: null,
    doc: null,
  },
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
    case REQUEST_TIMEOUT: {
      return {
        ...state,
        requestTimeout: true,
      };
    }
    case INVALID_DISCUSSION: {
      const userError = { ...state.userError };
      userError.invalidDiscussion = true;
      return {
        ...state,
        userError: userError,
      };
    }
    case TAKEN_NICKNAME: {
      const userError = { ...state.userError };
      userError.createUser.takenNickname = true;
      return {
        ...state,
        userError: userError,
      };
    }
    case TAKEN_USER_ID: {
      const userError = { ...state.userError };
      userError.createUser.takenUserId = true;
      return {
        ...state,
        userError: userError,
      };
    }
    case MOVE_UNABLED: {
      const userError = { ...state.userError };
      userError.concurrency.moveUnabled = true;
      return {
        ...state,
        userError: userError,
      };
    }
    case EDIT_UNABLED: {
      const userError = { ...state.userError };
      userError.concurrency.editUnabled = true;
      return {
        ...state,
        requestTimeout: false,
        userError: userError,
      };
    }
    case BAD_TARGET: {
      const userError = { ...state.userError };
      userError.concurrency.badTarget = true;
      return {
        ...state,
        requestTimeout: false,
        userError: userError,
      };
    }
    case CREATE_NICKNAME: {
      const events = { ...state.events };
      events.createNickname = true;

      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
    }
    case CREATE_USER: {
      const events = { ...state.events };
      events.createUser.pending = true;
      const userError = { ...state.userError };
      userError.createUser.takenNickname = false;
      return {
        ...state,
        events: events,
        requestTimeout: false,
        userError: userError,
      };
    }
    case JOIN_USER: {
      const events = { ...state.events };
      events.joinUser.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
    }
    case CREATE_USER_FULFILLED: {
      const events = { ...state.events };
      events.createUser = { ...defaultState.events.createUser };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
    }
    case JOIN_USER_FULFILLED: {
      const events = { ...state.events };
      events.joinUser = { ...defaultState.events.joinUser };
      events.joined = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
        discussionId: action.payload.discussionId,
        userId: action.payload.userId,
        nickname: action.payload.nickname,
      };
    }
    case JOINED_USER: {
      const icons = [...state.icons];
      icons.push(action.payload.icon);
      return {
        ...state,
        icons: icons,
      };
    }
    case LOAD_USER: {
      const events = { ...state.events };
      events.loadUser.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
    }
    case LOAD_USER_FULFILLED: {
      const events = { ...state.events };
      events.loadUser.pending = false;
      const chatMap = { ...state.chatMap };
      const docMap = { ...state.docMap };
      return {
        ...state,
        requestTimeout: false,
        events: events,
        icons: action.payload.icons,
        currentUnit: action.payload.currentUnit,
        timeline: action.payload.timeline,
        posts: action.payload.chatHistory,
        chatMap: Object.assign(chatMap, action.payload.chatMapAdd),
        docMap: Object.assign(docMap, action.payload.docMapAdd),
      };
    }
    case LOAD_UNIT_PAGE: {
      const events = { ...state.events };
      events.loadUnitPage.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
    }
    case LOAD_UNIT_PAGE_FULFILLED: {
      const events = { ...state.events };
      events.loadUnitPage = { ...defaultState.events.loadUnitPage };
      const timeline = [...state.timeline];
      timeline.push(action.payload.timelineEntry);
      const docMap = { ...state.docMap };
      return {
        ...state,
        requestTimeout: false,
        events: events,
        ancestors: action.payload.ancestors,
        currentUnit: action.payload.currentUnit,
        timeline: timeline,
        documentTree: action.payload.children,
        backlinkTree: action.payload.backlinks,
        docMap: Object.assign(docMap, action.payload.docMapAdd),
      };
    }
    case CREATE_POST: {
      const events = { ...state.events };
      events.post.pending = true;
      events.post.content.pith = action.payload.pith;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
    }
    case CREATE_POST_FULFILLED: {
      const events = { ...state.events };
      events.post = { ...defaultState.events.post };
      return {
        ...state,
        requestTimeout: false,
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
    case GET_CONTEXT: {
      const events = { ...state.events };
      events.getContext.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
    }
    case GET_CONTEXT_FULFILLED: {
      const events = { ...state.events };
      events.getContext = { ...defaultState.events.getContext };
      return {
        ...state,
        requestTimeout: false,
        events: events,
        currentContext: action.payload.context,
      };
    }
    case SEARCH: {
      const events = { ...state.events };
      events.search.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
    }
    case SEARCH_FULFILLED: {
      const events = { ...state.events };
      const searchResults = { ...state.searchResults };
      const chatMap = { ...state.chatMap };
      const docMap = { ...state.docMap };
      events.search = { ...defaultState.events.search };
      searchResults.chat = action.payload.chatResults;
      searchResults.doc = action.payload.docResults;
      return {
        ...state,
        requestTimeout: false,
        events: events,
        searchResults: searchResults,
        chatMap: Object.assign(chatMap, action.payload.chatMapAdd),
        docMap: Object.assign(docMap, action.payload.docMapAdd),
      };
    }
    case SEND_TO_DOC: {
    }
    case SEND_TO_DOC_FULFILLED: {
    }
    case ADD_UNIT: {
    }
    case ADD_UNIT_FULFILLED: {
    }
    case HIDE_UNIT: {
    }
    case HIDE_UNIT_FULFILLED: {
    }
    case UNHIDE_UNIT: {
    }
    case UNHIDE_UNIT_FULFILLED: {
    }
    case SELECT_UNIT: {
    }
    case SELECT_UNIT_FULFILLED: {
    }
    case DESELECT_UNIT: {
    }
    case DESELECT_UNIT_FULFILLED: {
    }
    case MOVE_UNIT: {
    }
    case MOVE_UNIT_FULFILLED: {
    }
    case REQUEST_EDIT_UNIT: {
    }
    case REQUEST_EDIT_UNIT_FULFILLED: {
    }
    case DEEDIT_UNIT: {
    }
    case DEEDIT_UNIT_FULFILLED: {
    }
    case EDIT_UNIT: {
    }
    case EDIT_UNIT_FULFILLED: {
    }
    case JOINED_USER: {
    }
    case CREATED_POST: {
    }
    case ADDED_UNIT: {
    }
    case EDITED_UNIT: {
    }
    case ADDED_BACKLINKS: {
    }
    case REMOVED_BACKLINKS: {
    }
    case HID_UNIT: {
    }
    case UNHID_UNIT: {
    }
    case REPOSITIONED_UNIT: {
    }
    case LOCKED_EDIT: {
    }
    case UNLOCKED_EDIT: {
    }
    case LOCKED_POSITION: {
    }
    case UNLOCKED_POSITION: {
    }
    default: {
      return { ...state };
    }
  }
};

export default discussionReducer;
