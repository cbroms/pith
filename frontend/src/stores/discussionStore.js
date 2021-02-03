import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { discussionSocket } from "./socket";

const defaultState = {
	discussionId: null,
	joinDiscussionError: null,
	// chat, pinned, focus
};

export const discussionStore = createDerivedSocketStore(
	discussionSocket,
	{
		joinDiscussion: (discussionId, userId, resolve) => {
			return (socket, update) => {
				/*
				socket.emit(
					"join",
					{ discussion_id: discussionId },
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
								};
							});
						}
					}
				);
				*/
				update((state) => {return {...state, discussionId: "testDiscussion"}});
			};
		},
	},
	defaultState
);
