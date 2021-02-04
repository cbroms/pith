import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { boardSocket } from "./socket";
// import { chat } from "./chat";
import {
    hasUserAlreadyJoinedBoard,
    setUserJoinedBoard,
    getUserId,
} from "../api/utils";

const defaultState = {
    isValidBoard: null,
    hasJoinedBoard: null,
    joinBoardError: null,
    userId: null,
    boardId: null,
    nickname: null,
};

export const boardStore = createDerivedSocketStore(
    boardSocket,
    {
        initialize: (boardId, resolve, reject) => {
            return (socket, update, set) => {
                // determine if board connection is valid
                /* TODO real input
                socket.emit(
                    "test_connect",
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
                update((state) => { return { ...state, isValidBoard: true } });

                // set state with whether user joined or not from localstorage
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
                        // TODO: check exact error
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
                update((state) => { return { ...state, userId: testUser } });
            };
        },
        joinBoard: (boardId, userId, resolve) => {
            return (socket, update) => {
                // try to join the board with the userId
                /* TODO real input
                socket.emit(
                    "join",
                    { board_id: boardId, user_id: userId },
                    (res) => {
                        const json = JSON.parse(res);
                        // TODO MODIFY error
                        if ("error" in json) {
                            update((state) => {
                                return { ...state, joinBoardError: true };
                            });
                        } else {
                            update((state) => {
                                return {
                                    ...state,
                                    nickname: json.nickname,
                                    hasJoinedBoard: true,
                                    boardId: boardId,
                                };
                            });
                            // update the local store to include the userId for this board
                            setUserJoinedBoard(boardId, userId);
                        }
                    }
                );
                */
                // TODO fake input
            };
        },
    },
    defaultState
);
