import { getValue, setValue } from "./storageApi";

// if the user has joined the discussion already, the discussionId will be kept in localstorage
// in the joinedDiscussions object as a key.
export const hasUserAlreadyJoinedDiscussion = (discussionId) => {
	const joinedDiscussions = getValue("joinedDiscussions");

	if (joinedDiscussions === null) return false;
	if (!Object.keys(joinedDiscussions).includes(discussionId)) return false;

	return true;
};

// add the userId to the object in localstorage containing all the discussions the user has
// joined. joinedDiscussions is an object with keys of discussionIds mapping to the user's
// userId for that discussion.
export const setUserJoinedDiscussion = (discussionId, userId) => {
	const joinedDiscussions = getValue("joinedDiscussions");

	if (joinedDiscussions === null)
		setValue("joinedDiscussions", { [discussionId]: userId });
	else {
		setValue("joinedDiscussions", {
			...joinedDiscussions,
			[discussionId]: userId,
		});
	}
};

export const getUserId = (discussionId) => {
	const joinedDiscussions = getValue("joinedDiscussions");

	if (joinedDiscussions === null) return null;
	if (!Object.keys(joinedDiscussions).includes(discussionId)) return null;

	return joinedDiscussions[discussionId];
};
