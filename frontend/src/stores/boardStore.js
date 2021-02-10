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
                            if (json.error == errors.DNE_BOARD) {
                                update((state) => {
                                    return {
                                        ...state,
                                        isValidBoard: false,
                                    };
                                });
                            } else {
                                errorHandler(json.error, json.error_meta, update);
                            }
                            resolve()
                        }
                    }
                );
               
                // TODO fake input
                // update((state) => { return { ...state, isValidBoard: true } });

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
                            errorHandler(json.error, json.error_meta);
                        }
                    }
                );
                
                // TODO fake input
               // update((state) => { return { ...state, userId: testUser } });

                // update the local store to include the userId for this board
                setUserJoinedBoard(boardId, userId);
            };
        },
        loadBoard: (boardId, userId, resolve, reject) => {
            return (socket, update) => {

                console.log(socket, update)

                // try to join the board with the userId
                socket.emit(
                    "load_board",
                    { board_id: boardId, user_id: userId },
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
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta);
                        }
                    }
                );
                
                // TODO fake input
            };
        },
        updateBoard: (boardId, userId, nickname, resolve) => {
            return (socket, update) => {
              
                socket.emit(
                    "update_board",
                    { board_id: boardId, user_id: userId },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) { // success
                            let units = [...state.units];
                            // remove changed elements
                            units = units.filter(
                              json.updated_unit_ids.some((id) === e.id)
                            );
                            // add changed elements
                            units = units.concat(json.updated_units);
                            update((state) => {
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta);
                        }
                    }
                );
               
            };
        },
        addUnit: (boardId, text, resolve, reject) => {
            return (socket, update) => {
                socket.emit(
                    "add_unit",
                    { board_id: boardId, text: text },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            update((state) => {
                                return {
                                    ...state,
                                    units: [...state.units, json.unit],
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        removeUnit: (boardId, unitId, resolve, reject) => {
            return (socket, update) => {
                socket.emit(
                    "remove_unit",
                    { board_id: boardId, unit_id: unitId },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            let units = [...state.units];
                            // TODO
                            units = units.filter((e) => { e.id === unitId });
                            update((state) => {
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        editUnit: (boardId, unitId, text, resolve, reject) => {
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
                                    return json.unit;
                                }
                                return e;
                            });
                            update((state) => {
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        addLink: (boardId, source, target, resolve, reject) => {
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
                                    e.links_to.push(json.link);
                                }
                                else if (e.id === target) {
                                    e.links_from.push(json.link);
                                }
                                return e;
                            });
                            update((state) => {
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        removeLink: (boardId, linkId, resolve, reject) => {
            return (socket, update) => {
                socket.emit(
                    "remove_link",
                    { board_id: boardId, link_id: linkId },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            let units = [...state.units];
                            // TODO, map returns new array
                            units = units.map((e) => {
                                if (e.id === link.source) {
                                    e.links_to = e.links_to.filter(
                                        (l) => { l.id === json.link.id }
                                    );
                                }
                                else if (e.id === link.target) {
                                    e.links_from = e.links_from.filter(
                                        (l) => { l.id === json.link.id }
                                    );
                                }
                                return e;
                            });
                            update((state) => {
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        getUnitFull: (boardId, unitId, resolve, reject) => {
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
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        createDiscussion: (boardId, unitId, resolve, reject) => {
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
                                    e.discussions.push(json.discussion_id);
                                }
                                return e;
                            });
                            update((state) => {
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta);
                        }
                    }
                );
            }
        }
    },
    defaultState
);
