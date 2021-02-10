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
    focus: [],
    // array of user objects in rendering order with
    // id, nickname
    participants: [],
};

export const discussionStore = createDerivedSocketStore(
    discussionSocket,
    {
        joinDiscussion: (boardId, discussionId, userId, resolve, reject) => {
            return (socket, update) => {
                /* TODO real input
                socket.emit(
                    "join_disc",
                    { board_id: boardId, discussion_id: discussionId, user_id: userId },
                    (res) => {
                        const json = JSON.parse(res);

                        if (!json.error) {
			    // not done
                        } else {
                            errorHandler(reject, json.error, json.error_meta);
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
                                return {
                                    ...state,
                                    discussionId: discussionId,
                                    chat: json.chat,
                                    pinned: json.pinned,
                                    focused: json.focused,
                                    participants: json.participants,
                                };
                            });
                            resolve(); // done
                        } else {
                            errorHandler(reject, json.error, json.error_meta);
                        }
                    }
		);
                */
                // TODO fake input
                update((state) => { return { ...state, discussionId: "testDiscussion" } });
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
                                    pinned: [],
                                    focused: [],
                                    participants: [],
                                };
                            });
                            resolve();
                        }
                        else {
                            errorHandler(reject, json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        post: (boardId, discussionId, userId, text, resolve, reject) => {

           
            return (socket, update) => {
                console.log("posted")

                const tempId = uuid();

                // add the post temporarily 
                const newPost = {
                    id: tempId,
                    pith: text,
                    author: "me",
                    time: (new Date()).toISOString(),
                }
                update(state => {
                    return {...state, temporaryChat: [...state.temporaryChat, newPost]}
                })

                // simulate server response time 
                setTimeout(() => {
                    update((state) => {
                        // now we have the real post, so we remove the temporary chat unit 
                        const newTemporaryChat = [...state.temporaryChat].filter(post => post.id !== tempId);
                        return {
                            ...state,
                            temporaryChat: newTemporaryChat,
                        }
                    });
                }, 1500)

                socket.emit(
                    "post",
                    { board_id: boardId, discussion_id: discussionId, user_id: userId, text: text },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            update((state) => {

                                // now we have the real post, so we remove the temporary chat unit 
                                const newTemporaryChat = [...state.temporaryChat].filter(post => post.id !== tempId);

                                return {
                                    ...state,
                                    chat: [...state.chat, json.unit],
                                    temporaryChat: newTemporaryChat,
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(reject, json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        addPinned: (boardId, discussionId, unitId, resolve, reject) => {
            return (socket, update) => {
                socket.emit(
                    "add_pinned",
                    { board_id: boardId, discussion_id: discussionId, unit_id: unitId },
                    (res) => {
                        const json = JSON.parse(res);
                        if (!json.error) {
                            update((state) => {
                                return {
                                    ...state,
                                    pinned: [...state.pinned, json.unit],
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(reject, json.error, json.error_meta);
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
                                pinned = pinned.filter((e) => { e.id === unitId });
                                return {
                                    ...state,
                                    pinned: pinned
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(reject, json.error, json.error_meta);
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
                            update((state) => {
                                return {
                                    ...state,
                                    focused: [...state.focused, json.unit],
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(reject, json.error, json.error_meta);
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
                                focused = focused.filter((e) => { e.id === unitId });
                                return {
                                    ...state,
                                    focused: focused
                                }
                            });
                            resolve();
                        }
                        else {
                            errorHandler(reject, json.error, json.error_meta);
                        }
                    }
                );
            }
        },
        // TODO do below need some ids for the board/room?
        subscribeJoin: () => {
            return (socket, update) => {
                socket.on(
                    "join_disc",
                    (res) => {
                        const json = JSON.parse(res);
                        update((state) => {
                            return {
                                ...state,
                                participants: [...state.participants, json.user],
                            }
                        });
                    }
                );
            }
        },
        subscribeLeave: () => {
            return (socket, update) => {
                socket.on(
                    "leave_disc",
                    (res) => {
                        const json = JSON.parse(res);
                        update((state) => {
                            let participants = [...state.participants];
                            // TODO
                            participants = participants.filter((e) => { e.id === json.user_id });
                            return {
                                ...state,
                                participants: participants
                            }
                        });
                    }
                );
            }
        },
        subscribePosts: () => {
            return (socket, update) => {
                socket.on(
                    "post",
                    (res) => {
                        const json = JSON.parse(res);
                        update((state) => {
                            return {
                                ...state,
                                chat: [...state.chat, json.unit],
                            }
                        });
                    }
                );
            }
        },
        subscribeAddPinned: () => {
            return (socket, update) => {
                socket.on(
                    "add_pinned",
                    (res) => {
                        const json = JSON.parse(res);
                        update((state) => {
                            return {
                                ...state,
                                pinned: [...state.pinned, json.unit],
                            }
                        });
                    }
                );
            }
        },
        subscribeRemovePinned: () => {
            return (socket, update) => {
                socket.on(
                    "remove_pinned",
                    (res) => {
                        const json = JSON.parse(res);
                        update((state) => {
                            let pinned = [...state.pinned];
                            // TODO
                            pinned = pinned.filter((e) => { e.id === json.unit_id });
                            return {
                                ...state,
                                pinned: pinned
                            }
                        });
                    }
                );
            }
        },
        subscribeAddFocused: () => {
            return (socket, update) => {
                socket.on(
                    "add_focused",
                    (res) => {
                        const json = JSON.parse(res);
                        update((state) => {
                            return {
                                ...state,
                                focused: [...state.focused, json.unit],
                            }
                        });
                    }
                );
            }
        },
        subscribeRemoveFocused: () => {
            return (socket, update) => {
                socket.on(
                    "remove_focused",
                    (res) => {
                        const json = JSON.parse(res);
                        update((state) => {
                            let focused = [...state.focused];
                            // TODO
                            focused = focused.filter((e) => { e.id === json.unit_id });
                            return {
                                ...state,
                                focused: focused
                            }
                        });
                    }
                );
            }
        }
    },
    defaultState
);
