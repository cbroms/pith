import {
  COMPLETE_REQUEST,
  SYSTEM_ERROR,
  INVALID_DISCUSSION,
  TAKEN_NICKNAME,
  TAKEN_USER_ID,
  MOVE_UNABLED,
  EDIT_UNABLED,
  BAD_TARGET,
  CHAT_MAP,
  DOC_MAP,
  TEST_CONNECT,
  TEST_CONNECT_FULFILLED,
  CREATE_NICKNAME,
  CREATE_USER,
  JOIN_USER,
  CREATE_USER_FULFILLED,
  JOIN_USER_FULFILLED,
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
  MOVE_UNITS,
  MOVE_UNITS_FULFILLED,
  REQUEST_EDIT_UNIT,
  REQUEST_EDIT_UNIT_FULFILLED,
  DEEDIT_UNIT,
  DEEDIT_UNIT_FULFILLED,
  EDIT_UNIT,
  EDIT_UNIT_FULFILLED,
	LEFT_USER,
	SET_CURSOR,
  CREATED_POST,
  ADDED_UNIT,
  REMOVED_UNIT,
  ADDED_BACKLINK,
  REMOVED_BACKLINK,
  HID_UNIT,
  UNHID_UNIT,
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
  completedRequests: {},
  // valid state
  discussionId: null,
  userId: null,
  nickname: null,
  chatMap: {},
  docMap: { _: { pith: "", children: [] } },
  posts: [],
  currentUnit: "_",
  ancestors: [],
  documentTree: [], // consider adding children to cache so don't need this => rerender whenever some is updated?
  backlinkTree: [], // consider adding children to cache so don't need this => rerender whenever some is updated?
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
    case COMPLETE_REQUEST {
      const completedRequests = {...state.completedRequests};
      completedRequests[action.payload.id] = action.payload.value;
      return {
        ...state,
        completedRequests: completedRequests
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
    case REQUEST_TIMEOUT: {
      return {
        ...state,
        requestTimeout: true,
      };
      break;
    }
    case INVALID_DISCUSSION: {
      const userError = { ...state.userError };
      userError.invalidDiscussion = true;
      return {
        ...state,
        userError: userError,
      };
      break;
    }
    case TAKEN_NICKNAME: {
      const userError = { ...state.userError };
      userError.createUser.takenNickname = true;
      return {
        ...state,
        userError: userError,
      };
      break;
    }
    case TAKEN_USER_ID: {
      const userError = { ...state.userError };
      userError.createUser.takenUserId = true;
      return {
        ...state,
        userError: userError,
      };
      break;
    }
    case MOVE_UNABLED: {
      const userError = { ...state.userError };
      userError.concurrency.moveUnabled = true;
      return {
        ...state,
        userError: userError,
      };
      break;
    }
    case EDIT_UNABLED: {
      const userError = { ...state.userError };
      userError.concurrency.editUnabled = true;
      return {
        ...state,
        requestTimeout: false,
        userError: userError,
      };
      break;
    }
    case BAD_TARGET: {
      const userError = { ...state.userError };
      userError.concurrency.badTarget = true;
      return {
        ...state,
        requestTimeout: false,
        userError: userError,
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
    case TEST_CONNECT: {
      const events = { ...state.events };
      events.testConnect.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case TEST_CONNECT_FULFILLED: {
      const events = { ...state.events };
      events.testConnect = { ...defaultState.events.testConnect };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case CREATE_NICKNAME: {
      const events = { ...state.events };
      events.createNickname = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
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
      break;
    }
    case JOIN_USER: {
      const events = { ...state.events };
      events.joinUser.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case CREATE_USER_FULFILLED: {
      const events = { ...state.events };
      events.createUser = { ...defaultState.events.createUser };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
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
    case LOAD_UNIT_PAGE: {
      const events = { ...state.events };
      events.loadUnitPage.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case LOAD_UNIT_PAGE_FULFILLED: {
      const events = { ...state.events };
      events.loadUnitPage = { ...defaultState.events.loadUnitPage };
      const timeline = [...state.timeline];
      timeline.push(action.payload.timelineEntry);
      return {
        ...state,
        requestTimeout: false,
        events: events,
        ancestors: action.payload.ancestors,
        currentUnit: action.payload.currentUnit,
        timeline: timeline,
        documentTree: action.payload.children,
        backlinkTree: action.payload.backlinks,
      };
      break;
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
      break;
    }
    case CREATE_POST_FULFILLED: {
      const events = { ...state.events };
      events.post = { ...defaultState.events.post };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case GET_CONTEXT: {
      const events = { ...state.events };
      events.getContext.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
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
      break;
    }
    case SEARCH: {
      const events = { ...state.events };
      events.search.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case SEARCH_FULFILLED: {
      const events = { ...state.events };
      const searchResults = { ...state.searchResults };
      events.search = { ...defaultState.events.search };
      searchResults.chat = action.payload.chatResults;
      searchResults.doc = action.payload.docResults;
      return {
        ...state,
        requestTimeout: false,
        events: events,
        searchResults: searchResults,
      };
      break;
    }
    case SEND_TO_DOC: {
      const events = { ...state.events };
      events.sendToDoc.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case SEND_TO_DOC_FULFILLED: {
      const events = { ...state.events };
      events.sendToDoc = { ...defaultState.events.sendToDoc };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case ADD_UNIT: {
      const events = { ...state.events };
      events.addUnit.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case ADD_UNIT_FULFILLED: {
      const events = { ...state.events };
      events.addUnit = { ...defaultState.events.addUnit };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case HIDE_UNIT: {
      const events = { ...state.events };
      events.hideUnit.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case HIDE_UNIT_FULFILLED: {
      const events = { ...state.events };
      events.hideUnit = { ...defaultState.events.hideUnit };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case UNHIDE_UNIT: {
      const events = { ...state.events };
      events.unhideUnit.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case UNHIDE_UNIT_FULFILLED: {
      const events = { ...state.events };
      events.unhideUnit = { ...defaultState.events.unhideUnit };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case SELECT_UNIT: {
      const events = { ...state.events };
      events.selectUnit.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case SELECT_UNIT_FULFILLED: {
      const events = { ...state.events };
      events.selectUnit = { ...defaultState.events.selectUnit };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case DESELECT_UNIT: {
      const events = { ...state.events };
      events.deselectUnit.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case DESELECT_UNIT_FULFILLED: {
      const events = { ...state.events };
      events.deselectUnit = { ...defaultState.events.deselectUnit };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case MOVE_UNITS: {
      const events = { ...state.events };
      events.moveUnits.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case MOVE_UNITS_FULFILLED: {
      const events = { ...state.events };
      events.moveUnits = { ...defaultState.events.moveUnits };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case REQUEST_EDIT_UNIT: {
      const events = { ...state.events };
      events.requestEdit.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case REQUEST_EDIT_UNIT_FULFILLED: {
      const events = { ...state.events };
      events.requestEdit = { ...defaultState.events.requestEdit };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case DEEDIT_UNIT: {
      const events = { ...state.events };
      events.deeditUnit.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case DEEDIT_UNIT_FULFILLED: {
      const events = { ...state.events };
      events.deeditUnit = { ...defaultState.events.deeditUnit };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case EDIT_UNIT: {
      const events = { ...state.events };
      events.editUnit.pending = true;
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case EDIT_UNIT_FULFILLED: {
      const events = { ...state.events };
      events.editUnit = { ...defaultState.events.editUnit };
      return {
        ...state,
        requestTimeout: false,
        events: events,
      };
      break;
    }
    case SET_CURSOR: {
      const icons = {...state.icons};
			icons[action.payload.userId] = action.payload.icon;
      return {
        ...state,
        icons: icons,
      };
      break;
    }
    case LEFT_USER: {
      const icons = {...state.icons};
			del icons[action.payload.userId];
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
    case ADDED_UNIT: {
      // change documentTree
    }
    case EDITED_UNIT: {
      // change documentTree
    }
    case REMOVED_UNIT: {
      // change documentTree
    }
    case ADDED_BACKLINK: {
      // change backlinkTree
    }
    case REMOVED_BACKLINK: {
      // change backlinkTree
    }
    case HID_UNIT: {
      const docMap = { ...state.docMap };
      docMap[action.payload.unitId].hidden = true;
      return {
        ...state,
        docMap: docMap,
      };
      break;
    }
    case UNHID_UNIT: {
      const docMap = { ...state.docMap };
      docMap[action.payload.unitId].hidden = false;
      return {
        ...state,
        docMap: docMap,
      };
      break;
    }
    case LOCKED_EDIT: {
      const docMap = { ...state.docMap };
      docMap[action.payload.unitId].editLock = action.payload.nickname;
      return {
        ...state,
        docMap: docMap,
      };
      break;
    }
    case UNLOCKED_EDIT: {
      const docMap = { ...state.docMap };
      docMap[action.payload.unitId].editLock = null;
      return {
        ...state,
        docMap: docMap,
      };
      break;
    }
    case LOCKED_POSITION: {
      const docMap = { ...state.docMap };
      docMap[action.payload.unitId].positionLock = action.payload.nickname;
      return {
        ...state,
        docMap: docMap,
      };
      break;
    }
    case UNLOCKED_POSITION: {
      const docMap = { ...state.docMap };
      docMap[action.payload.unitId].positionLock = null;
      return {
        ...state,
        docMap: docMap,
      };
      break;
    }
    default: {
      return { ...state };
    }
  }
};

export default discussionReducer;
