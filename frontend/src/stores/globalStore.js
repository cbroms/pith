import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { globalSocket } from "./socket";
import { errors, errorHandler } from "./errors";

// snake-case
const defaultState = {
  boards: [],
};

export const globalStore = createDerivedSocketStore(
  globalSocket,
  {
    initialize: (resolve, reject) => {
      return (socket, update, set) => {
        // nothing now
        resolve();
      };
    },
    create: (resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "create_board",
          {},
          (res) => {
            console.log("create", res);
            const json = JSON.parse(res);
            if (!json.error) {
              update((state) => {
                return { 
                  ...state, 
                  boards: [...state.boards, json.board_id] 
                };
              });
              resolve();
            } else {
              errorHandler(json.error, json.error_meta, update);
            }
          }
        );
      };
    },
  },
  defaultState
);
