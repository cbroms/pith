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
  unitIds: [],
  units: {},
};

export const boardStore = createDerivedSocketStore(
  boardSocket,
  {
    initialize: (boardId, resolve, reject) => {
      return (socket, update, set) => {
        // determine if board connection is valid
        socket.emit("join_board", { board_id: boardId }, (res) => {
          const json = JSON.parse(res);
          if (!json.error) {
            update((state) => {
              return {
                ...state,
                isValidBoard: true,
              };
            });
            resolve();
          } else {
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
            resolve();
          }
        });

        update((state) => {
          return {
            ...state,
            hasJoinedBoard: hasUserAlreadyJoinedBoard(boardId),
            userId: getUserId(boardId),
          };
        });
      };
    },
    createUser: (boardId, nickname, resolve, reject) => {
      // join page
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
            } else {
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
            if (!json.error) {
              // success
              update((state) => {
                // might be putting userId in again
                let units = {};
                for (const unit of json.units) {
                  units[unit.id] = unit;
                }
                return {
                  ...state,
                  boardId: boardId,
                  hasJoinedBoard: true,
                  userId: userId,
                  nickname: json.nickname,
                  unitIds: json.units.map((e) => {
                    return e.id;
                  }), // get ids
                  units: units,
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
    addUnit: (boardId, text, resolve, reject) => {
      return (socket, update) => {
        socket.emit("add_unit", { board_id: boardId, text: text }, (res) => {
          const json = JSON.parse(res);
          if (!json.error) {
            update((state) => {
              return {
                ...state,
                unitIds: [...state.unitIds, json.unit.id],
                units: { ...state.units, [json.unit.id]: json.unit },
              };
            });
            resolve();
          } else {
            errorHandler(json.error, json.error_meta, update);
          }
        });
      };
    },
    removeUnit: (boardId, unitId, resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "remove_unit",
          { board_id: boardId, unit_id: unitId },
          (res) => {
            const json = JSON.parse(res);
            if (!json.error) {
              update((state) => {
                let unitIds = [...state.unitIds];
                unitIds = unitIds.filter((e) => {
                  return e !== unitId;
                });
                return {
                  ...state,
                  unitIds: unitIds,
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
    editUnit: (boardId, unitId, text, resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "edit_unit",
          { board_id: boardId, unit_id: unitId, text: text },
          (res) => {
            const json = JSON.parse(res);
            if (!json.error) {
              update((state) => {
                return {
                  ...state,
                  units: { ...state.units, [json.unit.id]: json.unit }, // update
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
    addLink: (boardId, source, target, resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "add_link",
          { board_id: boardId, source: source, target: target },
          (res) => {
            const json = JSON.parse(res);
            if (!json.error) {
              update((state) => {
                let units = { ...state.units };
                // TODO, map returns new array
                if (source in units) {
                  if (units[source].links_to)
                    units[source].links_to.push(json.link);
                }
                if (target in units) {
                  if (units[target].links_from)
                    units[target].links_from.push(json.link);
                }
                return {
                  ...state,
                  units: units,
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
    removeLink: (boardId, linkId, resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "remove_link",
          { board_id: boardId, link_id: linkId },
          (res) => {
            const json = JSON.parse(res);
            if (!json.error) {
              update((state) => {
                let units = { ...state.units };
                if (json.link.source in units) {
                  if (units[json.link.source].links_to) {
                    units[json.link.source].links_to = units[
                      json.link.source
                    ].links_to.filter((l) => {
                      return l.id !== json.link.id;
                    });
                  }
                }
                if (json.link.target in units) {
                  if (units[json.link.target].links_from) {
                    units[json.link.target].links_from = units[
                      json.link.target
                    ].links_from.filter((l) => {
                      return l.id !== json.link.id;
                    });
                  }
                }
                return {
                  ...state,
                  units: units,
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
    getUnitFull: (boardId, unitId, resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "get_unit",
          { board_id: boardId, unit_id: unitId },
          (res) => {
            const json = JSON.parse(res);
            if (!json.error) {
              update((state) => {
                return {
                  ...state,
                  units: { ...state.units, [json.unit.id]: json.unit }, // update
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
    createDiscussion: (boardId, unitId, resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "create_disc",
          { board_id: boardId, unit_id: unitId },
          (res) => {
            const json = JSON.parse(res);
            if (!json.error) {
              update((state) => {
                let units = { ...state.units };
                if (unitId in units) {
                  if (units[unitId].discussions)
                    units[unitId].discussions.push(json.discussion);
                  else units[unitId].discussions = [json.discussion];
                }
                return {
                  ...state,
                  units: units,
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
    subscribeBoard: (resolve, reject) => {
      return (socket, update) => {
        socket.on(
          "update_board",
          (res) => {
            const json = JSON.parse(res);
            if (!json.error) {
              // success
              update((state) => {
                let unitIds = [...state.unitIds];
                unitIds = unitIds.filter((e) => !json.removed_ids.includes(e));

                let updatedUnits = {};
                for (const unit of json.updated_units) {
                  if (!unitIds.includes(unit.id)) {
                    unitIds.push(unit.id);
                  }
                  updatedUnits[unit.id] = unit;
                }

                // add changed elements, right overrides left if same key
                let units = { ...state.units };
                units = { ...units, ...updatedUnits };

                return {
                  ...state,
                  unitIds: unitIds,
                  units: units,
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
