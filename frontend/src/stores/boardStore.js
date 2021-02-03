import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { boardSocket } from "./socket";
import { chat } from "./chat";
import {
	hasUserAlreadyJoinedBoard,
	setUserJoinedBoard,
	getUserId,
} from "../api/utils";

const defaultState = {
	boardId: null,
	userId: null,
	nickname: null,
	isValidBoard: null,
	hasJoinedBoard: null,
	units: [],
};

export const boardStore = createDerivedSocketStore(
	boardSocket,
	{
		initialize: (boardId, resolve, reject) => {
			return (socket, update, set) => {
				// determine if board connection is valid
				/* TODO real input
				socket.emit(
					"join_board",
					{ board_id: boardId },
					(res) => {
						const json = JSON.parse(res);
						// TODO MODIFY error check
						update((state) => {
							return {
								...state,
								isValidBoard: !("error" in json),
							};
						});
						resolve();
					}
				);
				*/
				// TODO fake input
				update((state) => return {...state, isValidBoard: true});
		
				// TODO reconsider, set state with whether user joined or not from localstorage
				update((state) => {
					return {
						...state,
						hasJoinedBoard: hasUserAlreadyJoinedBoard(
							boardId
						),
						userId: getUserId(boardId),
					};
				});
			};
		},
		createUser: (boardId, nickname, resolve, reject) => {
			return (socket, update) => {
				// set the nickname for render
				update((state) => {
					return { ...state, nickname: nickname };
				});
				// try to create the new user
				/* TODO real input
				socket.emit(
					"create_user",
					{ board_id: boardId, nickname: nickname },
					(res) => {
						const json = JSON.parse(res);
						// TODO: check exact error, new error condition
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
				*/
				// TODO fake input
				update((state) => {return {...state, userId: testUser}});

				// TODO
				// update the local store to include the userId for this board
				setUserJoinedBoard(boardId, userId);
			};
		},
		// TODO, where to resolve user/board?
		joinBoard: (boardId, userId, resolve) => {
			return (socket, update) => {
				// try to join the board with the userId
				/* TODO real input
				socket.emit(
					"load_board",
					{ board_id: boardId },
					(res) => {
						const json = JSON.parse(res);
						// TODO MODIFY error
						update((state) => {
							return {
								...state,
								boardId: boardId,
								hasJoinedBoard: true,
								nickname: json.nickname,
								units: json.units, // TODO	
							};
						});
					}
				);
				*/
				// TODO fake input
			};
		},
		// addUnit
		// removeUnit
		// editUnit
		// addLink
		// removeLink
		// getUnitFull
		// createDiscussion
	},
	defaultState
);
