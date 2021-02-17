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
                        console.log(res);
                        const json = JSON.parse(res);
                        if (!json.error) {
                            update((state) => {
                                return { ...state, userId: json.user_id };
                            });
                            setUserJoinedBoard(boardId, json.user_id);
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }
                );
                
            };
        },
        loadBoard: (boardId, userId, resolve, reject) => {
            return (socket, update) => {

                // try to join the board with the userId
                socket.emit(
                    "load_board",
                    { board_id: boardId, user_id: userId },
                    (res) => {
                        
                        const json = JSON.parse(res);
                        if (!json.error) { // success
                            console.log(json)
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
                            errorHandler(json.error, json.error_meta, update);
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
                              (e) => { return !json.updated_unit_ids.some((id) === e.id) }
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
                            errorHandler(json.error, json.error_meta, update);
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
                            errorHandler( json.error, json.error_meta, update);
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
                            units = units.filter((e) => { return e.id !== unitId });
                            update((state) => {
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta, update);
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
                            errorHandler( json.error, json.error_meta, update);
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
                            update((state) => {
                                let units = [...state.units];
                                // TODO, map returns new array
                                units = units.map((e) => {
                                    if (e.id === source) {
                                        if (e.links_to)
                                            e.links_to.push(json.link);
                                        else 
                                            e.links_to = [json.link];
                                    }
                                    else if (e.id === target) {
                                        if (e.links_from)
                                            e.links_from.push(json.link);
                                        else 
                                            e.links_from = [json.link];
                                    }
                                    return e;
                                });
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta, update);
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
                            update((state) => {
                                let units = [...state.units];
                                // TODO, map returns new array
                                units = units.map((e) => {
                                    if (e.id === link.source) {
                                        if (e.links_to) // only matter if list exists
                                            e.links_to = e.links_to.filter(
                                                (l) => { return l.id !== json.link.id }
                                            );
                                    }
                                    else if (e.id === link.target) {
                                        if (e.links_from)
                                            e.links_from = e.links_from.filter(
                                                (l) => { return l.id !== json.link.id }
                                            );
                                    }
                                    return e;
                                });
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta, update);
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
                            
                            update((state) => {
                                let units = [...state.units];
                            // TODO, map returns new array
                                console.log(units);
                                units = units.map((e) => {
                                    if (e.id === unitId) {
                                        return json.unit;
                                    }
                                    else {
                                        return e;
                                    }
                                });
                                console.log(units);
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta, update);
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
                            update((state) => {
                                let units = [...state.units];
                                // TODO, map returns new array
                                units = units.map((e) => {
                                    if (e.id === unitId) {
                                        if (e.discussions)
                                            e.discussions.push(json.discussion);
                                        else 
                                            e.discussions = [json.discussion];
                                    }
                                    return e;
                                });
                                return {
                                    ...state,
                                    units: units,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler( json.error, json.error_meta, update);
                        }
                    }
                );
            }
        }
    },
    defaultState
);
