import { createDerivedSocketStore } from "./createDerivedSocketStore";

import { v4 as uuid } from "uuid";

const defaultState = {
	messages: [],
	pendingMessages: [],
	messagesContent: {},
};

// the fact that we have to do this is pretty weird
// TODO: change the shape of the server response so the keys
// are by default the unit ids
const unpackMeta = (metaArr) => {
	const meta = {};
	for (const unit of metaArr) {
		meta[unit.unit_id] = {
			pith: unit.pith,
			author: unit.author,
			createdAt: unit.created_at,
		};
	}
	return meta;
};

export const chat = createDerivedSocketStore(
	{
		initialize: (posts, postsMeta) => {
			return (socket, update) => {
				const meta = unpackMeta(postsMeta);
				update((state) => {
					return { ...state, messages: posts, messagesContent: meta };
				});
			};
		},
		makePost: (pith, nickname, resolve) => {
			return (socket, update) => {
				// create a new id to use for the pending message
				const pendingMessageId = uuid();
				// set the pending message id and content to state
				update((state) => {
					return {
						...state,
						pendingMessages: [
							...state.pendingMessages,
							pendingMessageId,
						],
						messagesContent: {
							...state.messagesContent,
							[pendingMessageId]: {
								pith: pith,
								author: nickname,
								createdAt: new Date().toISOString(),
							},
						},
					};
				});
				socket.emit("post", { pith: pith }, (res) => {
					const json = JSON.parse(res);

					update((state) => {
						// remove the pending message from the pending message array and messages content obj
						let newPending = [...state.pendingMessages];
						newPending.splice(
							newPending.indexOf(pendingMessageId),
							1
						);
						const newContent = { ...state.messagesContent };
						delete newContent[pendingMessageId];

						// add the real message that we just got
						const meta = unpackMeta(json.shared.chat_meta);

						return {
							...state,
							messages: [
								...state.messages,
								json.shared.created_post.unit_id,
							],
							pendingMessages: newPending,
							messagesContent: { ...newContent, ...meta },
						};
					});
				});
			};
		},
	},
	defaultState
);
