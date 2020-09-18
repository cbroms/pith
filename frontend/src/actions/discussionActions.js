import { socket } from "./socket";
import { getValue, setValue } from "../api/local";

import {
	JOIN_DISCUSSION,
	JOIN_DISCUSSION_FULFILLED,
	LOAD_DISCUSSION_PROGRESS,
	LOAD_DISCUSSION_FULFILLED,
	CLEAR_DISCUSSION,
	ERROR_BAD_PSEUDONYM,
	LOAD_DISCUSSION,
	BLOCK_SAVED,
	BLOCK_UNSAVED,
	BLOCK_TAGGED,
	BLOCK_UNTAGGED,
	POST_CREATED,
	ADD_POST,
	ADD_POST_FULFILLED,
	SUBSCRIBED_TO_DISCUSSION,
	SEARCH_DISCUSSION,
	SEARCH_DISCUSSION_FULFILLED,
} from "./types";

const joinDiscussion = (discussionID, userID, pseudonym) => {
	// join a discussion with a pseudonym and session ID
	const data = {
		name: pseudonym,
		discussion_id: discussionID,
		user_id: userID,
	};
	return (dispatch) => {
		dispatch({ type: JOIN_DISCUSSION });
		socket.emit("join", data, (res) => {
			try {
				res = JSON.parse(res);
				dispatch({
					type: JOIN_DISCUSSION_FULFILLED,
					payload: {
						id: discussionID,
						title: res.title,
						theme: res.theme,
					},
				});
				// add the discussion to the local list of discussions we've joined
				let discussions = getValue("joinedDiscussions");
				if (discussions === null) {
					setValue("joinedDiscussions", [discussionID]);
				} else if (!discussions.includes(discussionID)) {
					discussions.push(discussionID);
					setValue("joinedDiscussions", discussions);
				}
			} catch (e) {
				console.log(e);
				dispatch({
					type: ERROR_BAD_PSEUDONYM,
					payload: {
						id: discussionID,
						error: "BAD_PSEUDONYM",
					},
				});
			}
		});
	};
};

const clearDiscussion = () => {
	return (dispatch) => {
		dispatch({ type: CLEAR_DISCUSSION });
	};
};

const loadBlockHelper = (discussionID, blockID) => {
	const data = {
		discussion_id: discussionID,
		block_id: blockID,
	};
	return new Promise((resolve) => {
		socket.emit("get_block", data, (res) => {
			res = JSON.parse(res);
			resolve(res);
		});
	});
};

const loadDiscussion = (discussionID, userID) => {
	return (dispatch) => {
		dispatch({ type: LOAD_DISCUSSION });
		// load the discussions' posts and the posts' blocks.
		socket.emit("get_posts", { discussion_id: discussionID }, (res) => {
			try {
				res = JSON.parse(res);
				const loadedPosts = res;

				// count the number of total blocks to load
				const blocks = res.reduce(
					(t, { blocks }) => t + blocks.length,
					0
				);

				const loadedBlocks = {};

				// load each post's blocks
				for (const postsInd in res) {
					const post = res[postsInd];

					for (const blocksInd in post.blocks) {
						const block = post.blocks[blocksInd];

						// load the block
						loadBlockHelper(discussionID, block).then((data) => {
							// add the block's content to the loaded block object
							const blockClone = Object.assign({}, data);
							delete blockClone.block_id;
							loadedBlocks[data.block_id] = blockClone;

							// increment the number of blocks loaded so far
							dispatch({
								type: LOAD_DISCUSSION_PROGRESS,
								payload: { total: blocks },
							});

							// if this is the last block, dispatch the task is fulfilled and
							// send the posts and blocks
							if (
								parseInt(blocksInd) ===
									post.blocks.length - 1 &&
								parseInt(postsInd) === res.length - 1
							) {
								const data = {
									discussion_id: discussionID,
									user_id: userID,
								};
								// get the user's saved blocks
								socket.emit("get_saved_blocks", data, (res) => {
									const loadedSavedBlocks = JSON.parse(res);

									// dispatch the final loaded data
									dispatch({
										type: LOAD_DISCUSSION_FULFILLED,
										payload: {
											blocks: loadedBlocks,
											posts: loadedPosts,
											savedBlocks: loadedSavedBlocks,
										},
									});
								});
							}
						});
					}
				}
				if (res.length === 0) {
					// dispatch the final loaded data
					dispatch({
						type: LOAD_DISCUSSION_FULFILLED,
						payload: {
							blocks: [],
							posts: [],
							savedBlocks: [],
						},
					});
				}
			} catch (e) {
				console.log(e);
			}
		});
	};
};

const subscribeToDiscussion = (discussionID) => {
	// add all the socket event listeners for a given discussion
	return (dispatch) => {
		socket.on("saved_block", (data) => {
			data = JSON.parse(data);
			dispatch({
				type: BLOCK_SAVED,
				payload: { blockID: data.block_id },
			});
		});
		socket.on("unsaved_block", (data) => {
			data = JSON.parse(data);
			dispatch({
				type: BLOCK_UNSAVED,
				payload: { blockID: data.block_id },
			});
		});
		socket.on("tagged_block", (data) => {
			data = JSON.parse(data);
			dispatch({
				type: BLOCK_TAGGED,
				payload: {
					blockID: data.block_id,
					userID: data.user_id,
					tag: data.tag,
				},
			});
		});
		socket.on("untagged_block", (data) => {
			data = JSON.parse(data);
			dispatch({
				type: BLOCK_UNTAGGED,
				payload: { blockID: data.block_id, tag: data.tag },
			});
		});
		socket.on("created_post", (data) => {
			const post = JSON.parse(data);
			const loadedBlocks = {};

			// load the new post's blocks
			for (const blocksInd in post.blocks) {
				const block = post.blocks[blocksInd];

				// load the block
				loadBlockHelper(discussionID, block).then((data) => {
					// add the block's content to the loaded block object
					const blockClone = Object.assign({}, data);
					delete blockClone.block_id;
					loadedBlocks[data.block_id] = blockClone;

					// if this is the last block to be loaded, dispatch the create event
					if (parseInt(blocksInd) === post.blocks.length - 1) {
						dispatch({
							type: POST_CREATED,
							payload: { post: post, blocks: loadedBlocks },
						});
					}
				});
			}
		});
		dispatch({
			type: SUBSCRIBED_TO_DISCUSSION,
		});
	};
};

const addPostToDiscussion = (discussionID, userID, blocks) => {
	return (dispatch) => {
		const data = {
			discussion_id: discussionID,
			user_id: userID,
			blocks: blocks,
		};

		dispatch({
			type: ADD_POST,
		});
		socket.emit("create_post", data, (res) => {
			dispatch({
				type: ADD_POST_FULFILLED,
			});
		});
	};
};

const addTagToBlock = (discussionID, userID, blockID, tag) => {
	return (dispatch) => {
		const data = {
			discussion_id: discussionID,
			user_id: userID,
			block_id: blockID,
			tag: tag,
		};
		socket.emit("block_add_tag", data, (res) => {
			// nothing happens here because we're waiting for this to
			// emit a new event to the room called "tag_block", which
			// is listened for in subscribeToDiscussion
		});
	};
};

const removeTagFromBlock = (discussionID, userID, blockID, tag) => {
	return (dispatch) => {
		const data = {
			discussion_id: discussionID,
			user_id: userID,
			block_id: blockID,
			tag: tag,
		};
		// see addTagToBlock for why we don't update state
		socket.emit("block_remove_tag", data, (res) => {});
	};
};

const saveBlock = (discussionID, userID, blockID) => {
	return (dispatch) => {
		const data = {
			discussion_id: discussionID,
			user_id: userID,
			block_id: blockID,
		};
		// see addTagToBlock for why we don't update state
		socket.emit("save_block", data, (res) => {});
	};
};

const unsaveBlock = (discussionID, userID, blockID) => {
	return (dispatch) => {
		const data = {
			discussion_id: discussionID,
			user_id: userID,
			block_id: blockID,
		};
		// see addTagToBlock for why we don't update state
		socket.emit("unsave_block", data, (res) => {});
	};
};

const blockSearch = (discussionID, query) => {
	return (dispatch) => {
		dispatch({ type: SEARCH_DISCUSSION });
		const data = {
			discussion_id: discussionID,
			query: query,
		};
		socket.emit("search_basic", data, (res) => {
			res = JSON.parse(res);
			console.log(res);
			dispatch({
				type: SEARCH_DISCUSSION_FULFILLED,
				payload: res,
			});
		});
	};
};

const tagSearch = (discussionID, query) => {
	return (dispatch) => {
		dispatch({ type: SEARCH_DISCUSSION });
		const data = {
			discussion_id: discussionID,
			tags: query,
		};
		socket.emit("search_tags", data, (res) => {
			res = JSON.parse(res);
			dispatch({
				type: SEARCH_DISCUSSION_FULFILLED,
				payload: res,
			});
		});
	};
};

export {
	joinDiscussion,
	loadDiscussion,
	clearDiscussion,
	subscribeToDiscussion,
	addPostToDiscussion,
	addTagToBlock,
	removeTagFromBlock,
	saveBlock,
	unsaveBlock,
	blockSearch,
	tagSearch,
};
