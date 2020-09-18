import { listener, getter, setter } from "./apiConnection";

// discussion stuff
const getDiscussions = (func) => {
	getter("get", null, false, func);
};

const listenForNewDiscussion = (func) => {
	listener("created", func);
};

const createDiscussion = (data, func) => {
	setter(
		"create",
		{ title: data.title, theme: data.theme, time_limit: data.expiration },
		false,
		func
	);
};

const joinDiscussion = (data, func) => {
	setter(
		"join",
		{ discussion_id: data.discussionId, name: data.name },
		true,
		func
	);
};

const getDiscussionNames = (data, func) => {
	getter("get_names", { discussion_id: data }, false, func);
};

const leaveDiscussion = (data, func) => {
	setter("leave", { discussion_id: data }, true, func);
};

export {
	getDiscussions,
	joinDiscussion,
	leaveDiscussion,
	getDiscussionNames,
	createDiscussion,
	listenForNewDiscussion,
};
