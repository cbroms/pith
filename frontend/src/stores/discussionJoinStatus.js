import { createDerivedSocketStore } from "./createDerivedSocketStore";
import {
	hasUserAlreadyJoinedDiscussion,
	setUserJoinedDiscussion,
} from "../api/utils";

const defaultState = {
	isValidDiscussion: null,
	hasJoinedDiscussion: null,
	joinDiscussionError: null,
	userId: null,
	nickname: null,
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
		createUser: (discussionId, nickname, resolve, reject) => {
			return (socket, update) => {
				// set the nickname
				update((state) => {
					return { ...state, nickname: nickname };
				});
				// try to create the new user
				socket.emit(
					"create_user",
					{ discussion_id: discussionId, nickname: nickname },
					(res) => {
						const json = JSON.parse(res);
						// bad nickname!
						if ("error" in json) reject("Nickname unavailable");
						else {
							// created a new user sucessfully
							update((state) => {
								return { ...state, userId: json.user_id };
							});
							resolve();
						}
					}
				);
			};
		},
		joinDiscussion: (discussionId, userId, resolve) => {
			return (socket, update) => {
				// try to join the discussion with the userId
				socket.emit(
					"join",
					{ discussion_id: discussionId, user_id: userId },
					(res) => {
						const json = JSON.parse(res);
						// we weren't able to join :(
						if ("error" in json) {
							update((state) => {
								return { ...state, joinDiscussionError: true };
							});
						} else {
							// all is good, we've joined
							console.log(json);
							update((state) => {
								return { ...state, hasJoinedDiscussion: true };
							});
							// update the local store to include the userId for this discussion
							// so we can rejoin seamlessly if we reload the page
							setUserJoinedDiscussion(discussionId, userId);
						}
					}
				);
			};
		},
	},
	defaultState
);
