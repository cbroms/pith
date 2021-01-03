import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { hasUserAlreadyJoinedDiscussion } from "../api/utils";

const defaultState = {
	isValidDiscussion: null,
	hasJoinedDiscussion: null,
};

export const discussionJoinStatus = createDerivedSocketStore(
	{
		// check both if the discussion is valid and if user has joined the discussion
		initialize: (discussionId, resolve, reject) => {
			// https://pith-api.readthedocs.io/en/latest/discussion_schema.html#test-connect
			return (socket, update, set) => {
				// is the discussion valid?
				socket.emit(
					"test_connect",
					{ discussion_id: discussionId },
					(res) => {
						const json = JSON.parse(res);
						update((state) => {
							return {
								...state,
								isValidDiscussion: !("error" in json),
							};
						});
						resolve();
					}
				);
				// has the user joined the discussion before?
				update((state) => {
					return {
						...state,
						hasJoinedDiscussion: hasUserAlreadyJoinedDiscussion(
							discussionId
						),
					};
				});
			};
		},
		doSomething: () => {
			return (socket, update) => {
				console.log("doing something fun!");
			};
		},
	},
	defaultState
);
