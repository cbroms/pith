import {
	JOIN_DISCUSSION_FULFILLED,
	JOIN_DISCUSSION,
	LOAD_DISCUSSION,
	LOAD_DISCUSSION_FULFILLED,
	LOAD_DISCUSSION_PROGRESS,
	CLEAR_DISCUSSION,
	BLOCK_SAVED,
	BLOCK_UNSAVED,
	BLOCK_TAGGED,
	BLOCK_UNTAGGED,
	POST_CREATED,
	SUBSCRIBED_TO_DISCUSSION,
	SEARCH_DISCUSSION_FULFILLED,
} from "../actions/types";

const defaultState = {
	id: null,
	joiningDiscussion: false,
	joinedDiscussion: false,
	loadingDiscussion: false,
	loadedDiscussion: false,
	subscribed: false,
	totalToLoad: 0,
	numLoaded: 0,
	theme: "",
	title: "",
	blocks: {},
	savedBlocks: [],
	posts: [],
	searchResults: [],
};

const discussionReducer = (state = defaultState, action) => {
	switch (action.type) {
		case JOIN_DISCUSSION: {
			return { ...state, joiningDiscussion: true };
		}
		case JOIN_DISCUSSION_FULFILLED: {
			return {
				...state,
				joiningDiscussion: false,
				joinedDiscussion: true,
				id: action.payload.id,
				title: action.payload.title,
				theme: action.payload.theme,
			};
		}
		case LOAD_DISCUSSION: {
			return { ...state, loadingDiscussion: true };
		}
		case LOAD_DISCUSSION_PROGRESS: {
			return {
				...state,
				totalToLoad: action.payload.total,
				numLoaded: state.numLoaded + 1,
			};
		}
		case LOAD_DISCUSSION_FULFILLED: {
			return {
				...state,
				loadingDiscussion: false,
				loadedDiscussion: true,
				blocks: action.payload.blocks,
				posts: action.payload.posts,
				savedBlocks: action.payload.savedBlocks,
			};
		}
		case CLEAR_DISCUSSION: {
			return { ...state, ...defaultState };
		}
		case SUBSCRIBED_TO_DISCUSSION: {
			return { ...state, subscribed: true };
		}
		case BLOCK_SAVED: {
			const savedBlocks = [...state.savedBlocks];
			savedBlocks.push(action.payload.blockID);
			return { ...state, savedBlocks: savedBlocks };
		}
		case BLOCK_UNSAVED: {
			const savedBlocks = [...state.savedBlocks];
			savedBlocks.splice(savedBlocks.indexOf(action.payload.blockID), 1);
			return { ...state, savedBlocks: savedBlocks };
		}
		case BLOCK_TAGGED: {
			const blocks = { ...state.blocks };
			blocks[action.payload.blockID].tags.push({
				tag: action.payload.tag,
				owner: action.payload.userID,
			});
			return { ...state, blocks: blocks };
		}
		case BLOCK_UNTAGGED: {
			const blocks = { ...state.blocks };
			delete blocks[action.payload.blockID].tags[action.payload.tag];
			return { ...state, blocks: blocks };
		}
		case POST_CREATED: {
			const posts = [...state.posts];
			posts.push(action.payload.post);
			return {
				...state,
				posts: posts,
				blocks: Object.assign(state.blocks, action.payload.blocks),
			};
		}
		case SEARCH_DISCUSSION_FULFILLED: {
			return { ...state, searchResults: action.payload };
		}
		default: {
			return { ...state };
		}
	}
};

export default discussionReducer;
