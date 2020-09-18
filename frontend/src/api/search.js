import { getter } from "./apiConnection";

// searching
const makeBlockSearch = (data, func) => {
	getter(
		"search_discussion",
		{ query: data.query, discussion_id: data.discussionId },
		false,
		func
	);
};

const makeTagSearch = (data, func) => {
	getter(
		"search_discussion_tags",
		{ tags: data.query, discussion_id: data.discussionId },
		false,
		func
	);
};

export { makeBlockSearch, makeTagSearch };
