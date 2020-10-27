import {
  CREATE_POST,
  CREATE_POST_FULFILLED,
  CREATED_POST,
} from "../actions/types";

const defaultState = {
  systemError: false,
  userError: {
    
  },
  discussionId: null, 
  userId: null, 
  nickname: null, 
  events: {
    post: {
      pending: false,
      content: {
        pith: "",
      },
    },
  },
  chatMap: {},
  docMap: {},
  posts: [],
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
    case CREATE_POST: {
			const events = {...state.events};
      events.post.pending = true;
      events.post.content.pith = action.payload.pith;
			return { 
        ...state, 
        events: events
      };
    }
    case CREATE_POST_FULFILLED: {
			const events = {...state.events};
      events.post = {...defaultState.events.post};
			return { 
        ...state, 
        events: events
      };
    }
    case CREATED_POST: {
      const posts = [...state.posts];
      posts.push(action.payload.unitId); 
      const chatMap = {...state.chatMap};
      
      const docMap = {...state.docMap};
      return {
        ...state,
        posts: posts,
        chatMap: Object.assign(chatMap, action.payload.chatMapAdd),
        docMap: Object.assign(docMap, action.payload.docMapAdd),
      } 
    }
    default: {
      return {...state}
    }
  }
}

export default discussionReducer;
