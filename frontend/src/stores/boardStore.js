import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { boardSocket } from "./socket";
import { errors, errorHandler } from "./errors";
import {
    hasUserAlreadyJoinedBoard,
    setUserJoinedBoard,
    getUserId,
} from "../api/utils";

// snake-case
const defaultState = {
	boardId: null,
	isValidBoard: null,
	hasJoinedBoard: null,
	userId: null,
	nickname: null,
	// array of unit objects in order of rendering with 
	// id, pith, a map of transclusion ids to piths, 
	// [opt] linksTo, [opt] linksFrom, [opt] discussions
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
						if (!json.error) {
							update((state) => {
								return {
									...state,
									isValidBoard: true,
								};
							});
							resolve();
						}
						else {
							if (json.error == error.DNE_BOARD) {
								update((state) => {
									return {
										...state,
										isValidBoard: false,
									};
								});
							}
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
				*/
				// TODO fake input
				update((state) => return {...state, isValidBoard: true});
		
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
		createUser: (boardId, nickname, resolve, reject) => { // join page
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
						if (!json.error) {
							update((state) => {
								return { ...state, userId: json.user_id };
							});
							resolve();
						}
						else {
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
				*/
				// TODO fake input
				update((state) => {return {...state, userId: testUser}});

				// update the local store to include the userId for this board
				setUserJoinedBoard(boardId, userId);
			};
		},
		joinBoard: (boardId, userId, nickname, resolve) => { // load board
			return (socket, update) => {
				// try to join the board with the userId
				/* TODO real input
				socket.emit(
					"load_board",
					{ board_id: boardId },
					(res) => {
						const json = JSON.parse(res);
						if (!json.error) { // success
							update((state) => {
								// might be putting userId in again
								return {
									...state,
									boardId: boardId,
									hasJoinedBoard: true,
									userId: userId,
									nickname: json.nickname,
									units: json.units,	
								};
							});
						}
						else {
							errorHandler(json.error, json.error_meta);
						}
					}
				);
				*/
				// TODO fake input
			};
		},
		addUnit : (boardId, text, resolve, reject) => {
			return (socket, update) => {
				socket.emit(
					"add_unit", 
					{ board_id: boardId, text: text },
					(res) => {
						const json = JSON.parse(res);
						if (!json.error) {
							update((state) => {
								...state, 
								units: [...state.units, json.unit],
							});
							resolve();
						}
						else {
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
			}
		}
		removeUnit : (boardId, unitId, resolve, reject) => {
			return (socket, update) => {
				socket.emit(
					"remove_unit", 
					{ board_id: boardId, unit_id: unitId },
					(res) => {
						const json = JSON.parse(res);
						if (!json.error) {
							let units = [...state.units];
							// TODO
							units = units.filter((e) => {e.id === unitId});
							update((state) => {
								...state, 
								units: [...state.units, json.unit],
							});
							resolve();
						}
						else {
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
			}
		}
		editUnit : (boardId, unitId, text, resolve, reject) => {
			return (socket, update) => {
				socket.emit(
					"edit_unit", 
					{ board_id: boardId, unit_id: unitId, text: text },
					(res) => {
						const json = JSON.parse(res);
						if (!json.error) {
							let units = [...state.units];
							// TODO, map returns new array
							units = units.map((e) => {
								if (e.id === unitId) {
									e.pith = json.pith;
									e.transclusions = json.transclusions;
								}
								return e;
							});
							update((state) => {
								...state, 
								units: [...state.units, json.unit],
							});
							resolve();
						}
						else {
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
			}
		}
		addLink : (boardId, source, target, resolve, reject) => {
			return (socket, update) => {
				socket.emit(
					"add_link", 
					{ board_id: boardId, source: source, target: target },
					(res) => {
						const json = JSON.parse(res);
						if (!json.error) {
							let units = [...state.units];
							// TODO, map returns new array
							units = units.map((e) => {
								if (e.id === source) {
									e.links_to.push(json.links);
								}
								else if (e.id === target) {
									e.links_from.push(json.links);
								}
								return e;
							});
							update((state) => {
								...state, 
								units: [...state.units, json.unit],
							});
							resolve();
						}
						else {
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
			}
		}
		removeLink : (boardId, link, resolve, reject) => {
			return (socket, update) => {
				socket.emit(
					"remove_link", 
					{ board_id: boardId, link: link },
					(res) => {
						const json = JSON.parse(res);
						if (!json.error) {
							let units = [...state.units];
							// TODO, map returns new array
							units = units.map((e) => {
								if (e.id === link.source) {
									e.links_to = e.links_to.filter(
										(l) => {l.id === json.link.id}
									);
								}
								else if (e.id === link.target) {
									e.links_from = e.links_from.filter(
										(l) => {l.id === json.link.id}
									);
								}
								return e;
							});
							update((state) => {
								...state, 
								units: [...state.units, json.unit],
							});
							resolve();
						}
						else {
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
			}
		}
		getUnitFull : (boardId, unitId, resolve, reject) => {
			return (socket, update) => {
				socket.emit(
					"get_unit", 
					{ board_id: boardId, unit_id: unitId },
					(res) => {
						const json = JSON.parse(res);
						if (!json.error) {
							let units = [...state.units];
							// TODO, map returns new array
							units = units.map((e) => {
								if (e.id === unitId) {
									return json.unit;
								}
								else {
									return e;
								}
							});
							update((state) => {
								...state, 
								units: [...state.units, json.unit],
							});
							resolve();
						}
						else {
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
			}
		}
		createDiscussion : (boardId, unitId, resolve, reject) => {
			return (socket, update) => {
				socket.emit(
					"create_disc", 
					{ board_id: boardId, unit_id: unitId },
					(res) => {
						const json = JSON.parse(res);
						if (!json.error) {
							let units = [...state.units];
							// TODO, map returns new array
							units = units.map((e) => {
								if (e.id === unitId) {
									e.discussions.push(json.discussion);
								}
								return e;
							});
							update((state) => {
								...state, 
								units: [...state.units, json.unit],
							});
							resolve();
						}
						else {
							errorHandler(reject, json.error, json.error_meta);
						}
					}
				);
			}
		}
	},
	defaultState
);
