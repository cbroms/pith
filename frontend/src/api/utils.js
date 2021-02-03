import { getValue, setValue } from "./storageApi";

// If the user has joined the board already, the boardId will be kept in localstorage
// in the joinedBoards object as a key.
export const hasUserAlreadyJoinedBoard = (boardId) => {
	const joinedBoards = getValue("joinedBoards");

	if (joinedBoards === null) return false;
	if (!Object.keys(joinedBoards).includes(boardId)) return false;

	return true;
};

// Add the userId to the object in localstorage containing all the boards the user has
// joined. joinedBoards is an object with keys of boardIds mapping to the user's
// userId for that board.
export const setUserJoinedBoard = (boardId, userId) => {
	const joinedBoards = getValue("joinedBoards");

	if (joinedBoards === null)
		setValue("joinedBoards", { [boardId]: userId });
	else {
		setValue("joinedBoards", {
			...joinedBoards,
			[boardId]: userId,
		});
	}
};

export const getUserId = (boardId) => {
	const joinedBoards = getValue("joinedBoards");

	if (joinedBoards === null) return null;
	if (!Object.keys(joinedBoards).includes(boardId)) return null;

	return joinedBoards[boardId];
};
