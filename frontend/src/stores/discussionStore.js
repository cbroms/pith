import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { discussionSocket } from "./socket";

const defaultState = {
	discussionId: null,
	joinDiscussionError: null,
	chat: [],
	pinned: [],
	focus: [],
	participants: [],
};

export const discussionStore = createDerivedSocketStore(
	discussionSocket,
	{
		// TODO load...?
		joinDiscussion: (boardId, discussionId, userId, resolve) => {
			return (socket, update) => {
				/* TODO real input
				socket.emit(
					"join_disc",
					{ board_id: boardId, discussion_id: discussionId },
					(res) => {
						const json = JSON.parse(res);

						// TODO MODIFY error
						if ("error" in json) {
							update((state) => {
								return { ...state, joinDiscussionError: true };
							});
						} else {
							update((state) => {
								return {
									...state,
									discussionId: discussionId,
									participants: // TODO
								};
							});
						}
					}
				);
				*/
				// TODO fake input
				update((state) => {return {...state, discussionId: "testDiscussion"}});
			};
		},
		// leaveDiscussion
		// post
		// addPinned
		// removePinned
		// addFocused
		// removeFocused
		// getUnitLinks => for both focused and board units... TODO
		// subscribe...
	},
	defaultState
);
