import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { discussionSocket } from "./socket";
import { errors, errorHandler } from "./errors";
import {v4 as uuid } from "uuid"

// snake-case
const defaultState = {
    discussionId: null,
    joinDiscussionError: null,
    // array of unit objects in rendering order with
    // id, pith, created, author, and a map of transclusion ids to piths
    chat: [],
    // array of temporary unit objects, which we render while a request to add a unit is pending
    temporaryChat: [],
    // array of unit objects in rendering order with
    // id, pith, created, author, and a map of transclusion ids to piths
    pinned: [],
    // array of unit objects in rendering order with
    // id, pith, and a map of transclusion ids to piths
    focused: [],
    // array of user objects in rendering order with
    // id, nickname
    units: {},

    participants: [],
};

export const discussionStore = createDerivedSocketStore(
    discussionSocket,
    {
        joinDiscussion: (boardId, discussionId, userId, resolve, reject) => {
            return (socket, update) => {
                
                console.log("join_discussion", socket.id);
                socket.emit(
                    "join_disc",
                    { board_id: boardId, discussion_id: discussionId, user_id: userId },
                    (res) => {
                        const json = JSON.parse(res);

                        if (!json.error) {
			                // not done
                        } else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }
                );
		        socket.emit(
                    "load_disc",
                    { board_id: boardId, discussion_id: discussionId },
                    (res) => {
                        const json = JSON.parse(res);

                        if (!json.error) {
                            update((state) => {
                                let units = {}; 
                                for (const unit of json.chat) {
                                    units[unit.id] = unit;
                                }
                                return {
                                    ...state,
                                    discussionId: discussionId,
                                    chat: json.chat.map((e) => { return e.id; }),
                                    units: units,
                                    pinned: json.pinned.map((e) => { return e.id; }),
                                    focused: json.focused.map((e) => { return e.id; }),
                                    participants: json.participants,
                                };
                            });
                            resolve(); // done
                        } else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }

		);
                
                // TODO fake input
                // update((state) => { return { ...state, discussionId: "testDiscussion" } });
            };
        },
        leaveDiscussion: (boardId, discussionId, userId, resolve, reject) => {
            return (socket, update) => {
                socket.emit(
                    "leave_disc",
                    { board_id: boardId, discussion_id: discussionId, user_id: userId },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            update((state) => {
                                return {
                                    ...state,
                                    discussionId: null,
                                    chat: [],
                                    units: {},
                                    pinned: [],
                                    focused: [],
                                    participants: [],
                                };
                            });
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }
                );
            }
        },
        post: (boardId, discussionId, userId, nickname, text, resolve, reject) => {

           
            return (socket, update) => {
                console.log("posted", socket.id)

                const tempId = uuid();

                // add the post temporarily 
                const newPost = {
                    id: tempId,
                    pith: text,
                    author_name: nickname,
                    author_id: userId,
                    created: (new Date()).toISOString(),
                }
                update(state => {
                    return {...state, temporaryChat: [...state.temporaryChat, newPost]}
                })

                // // simulate server response time 
                // setTimeout(() => {
                //     update((state) => {
                //         // now we have the real post, so we remove the temporary chat unit 
                //         const newTemporaryChat = [...state.temporaryChat].filter(post => return post.id !== tempId);
                //         return {
                //             ...state,
                //             temporaryChat: newTemporaryChat,
                //         }
                //     });
                // }, 1500)

                socket.emit(
                    "post",
                    { board_id: boardId, discussion_id: discussionId, user_id: userId, text: text },
                    (res) => {
                        const json = JSON.parse(res);
                        console.log("received post" , json)
                        if (!json.error) {
                            update((state) => {

                                // now we have the real post, so we remove the temporary chat unit 
                                const newTemporaryChat = [...state.temporaryChat].filter((post) => { return post.id !== tempId });

                                return {
                                    ...state,
                                    chat: [...state.chat, json.unit.id],
                                    units: {...state.units, [json.unit.id]: json.unit},
                                    temporaryChat: newTemporaryChat,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }
                );
            }
        },
        addPinned: (boardId, discussionId, unitId, resolve, reject) => {
            return (socket, update) => {
                console.log(boardId, discussionId, unitId)
                socket.emit(
                    "add_pinned",
                    { board_id: boardId, discussion_id: discussionId, unit_id: unitId },
                    (res) => {
                        const json = JSON.parse(res);
                        console.log(json)
                        if (!json.error) {
                            update((state) => {
                                if (json.unit) { //(!state.pinned.some((e) => e === unitId)) {
                                  return {
                                      ...state,
                                      pinned: [...state.pinned, json.unit.id],
                                  }
                                }
                                else {
                                    return state;
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }
                );
            }
        },
        removePinned: (boardId, discussionId, unitId, resolve, reject) => {
            return (socket, update) => {
                socket.emit(
                    "remove_pinned",
                    { board_id: boardId, discussion_id: discussionId, unit_id: unitId },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            update((state) => {
                                let pinned = [...state.pinned];
                                // TODO
                                pinned = pinned.filter((e) => { return e !== unitId });
                                return {
                                    ...state,
                                    pinned: pinned
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }
                );
            }
        },
        addFocused: (boardId, discussionId, unitId, resolve, reject) => {
            return (socket, update) => {
                socket.emit(
                    "add_focused",
                    { board_id: boardId, discussion_id: discussionId, unit_id: unitId },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            // TODO fix this so the backend doesn't return a value if it shouldn't be added 
                            update((state) => {
                                if (json.unit) {//(!state.focused.some((e) => e === unitId)) {
                                  return {
                                      ...state,
                                      focused: [...state.focused, json.unit.id],
                                  }
                                } 
                                else {
                                    return state;
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }
                );
            }
        },
        removeFocused: (boardId, discussionId, unitId, resolve, reject) => {
            return (socket, update) => {
                socket.emit(
                    "remove_focused",
                    { board_id: boardId, discussion_id: discussionId, unit_id: unitId },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            update((state) => {
                                let focused = [...state.focused];
                                // TODO
                                focused = focused.filter((e) => { return e !== unitId });
                                return {
                                    ...state,
                                    focused: focused
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(json.error, json.error_meta, update);
                        }
                    }
                );
            }
        },
        // TODO do below need some ids for the board/room?
        subscribeDiscussion: () => {
            return (socket, update) => {
                console.log("subscribe called")
                socket.on(
                    "join_disc",
                    (res) => {
                        console.log("joined")
                        const json = JSON.parse(res);
                        update((state) => {
                            return {
                                ...state,
                                participants: [...state.participants, json.user],
                            }
                        });
                    }
                );
                socket.on(
                    "leave_disc",
                    (res) => {
                        console.log("left")

                        const json = JSON.parse(res);
                        update((state) => {
                            let participants = [...state.participants];
                            // TODO
                            participants = participants.filter((e) => { return e.id !== json.user_id });
                            return {
                                ...state,
                                participants: participants
                            }
                        });
                    }
                );

                socket.on(
                    "post",
                    (res) => {
                        console.log("posted")

                        const json = JSON.parse(res);
                        console.log("post", json);
                        update((state) => {
                            return {
                                ...state,
                                units: {...state.units, [json.unit.id]: json.unit},
                                chat: [...state.chat, json.unit.id],
                            }
                        });
                    }
                );

                socket.on(
                    "add_pinned",
                    (res) => {
                        console.log("pinned")

                        const json = JSON.parse(res);
                        update((state) => {
                            if (json.unit) {
                                return {
                                    ...state,
                                    pinned: [...state.pinned, json.unit.id],
                                }
                            }
                            else {
                                return state;
                            }
                        });
                    }
                );
                socket.on(
                    "remove_pinned",
                    (res) => {
                        console.log("unpinned")

                        const json = JSON.parse(res);
                        update((state) => {
                            let pinned = [...state.pinned];
                            // TODO
                            pinned = pinned.filter((e) => { return e !== json.unit_id });
                            return {
                                ...state,
                                pinned: pinned
                            }
                        });
                    }
                );

                socket.on(
                    "add_focused",
                    (res) => {
                        console.log("focused")

                        const json = JSON.parse(res);
                        update((state) => {
                            if (json.unit) {
                                return {
                                    ...state,
                                    focused: [...state.focused, json.unit.id],
                                }
                            }
                            else {
                                return state;
                            }
                        });
                    }
                );
                socket.on(
                    "remove_focused",
                    (res) => {
                        console.log("unfocused")

                        const json = JSON.parse(res);
                        update((state) => {
                            let focused = [...state.focused];
                            // TODO
                            focused = focused.filter((e) => { return e !== json.unit_id });
                            return {
                                ...state,
                                focused: focused
                            }
                        });
                    }
                );

            }
        },
    },
    defaultState
);
