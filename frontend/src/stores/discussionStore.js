import { createDerivedSocketStore } from "./createDerivedSocketStore";
import { discussionSocket } from "./socket";
import { errors, errorHandler } from "./errors";
import { v4 as uuid } from "uuid";

// snake-case
const defaultState = {
  discussionId: null,
  joinDiscussionError: null,
  // array of unit objects in rendering order with
  // id, pith, created, author, and a map of transclusion ids to piths
  chat: [],
  // index of unit at the end of most recent received page
  endIndex: -1,
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
  searchResults: [],
  typers: [],
  flares: ["Question", "Suggestion", "Meta"],
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
                for (const unit of json.pinned) {
                  units[unit.id] = unit;
                }
                const chat = json.chat.map((e) => {
                  return e.id;
                });
                console.log("chat", chat);
                return {
                  ...state,
                  discussionId: discussionId,
                  chat: chat,
                  endIndex: json.end_index,
                  units: units,
                  pinned: json.pinned.map((e) => {
                    return e.id;
                  }),
                  focused: json.focused.map((e) => {
                    return e.id;
                  }),
                  participants: json.participants,
                };
              });
              resolve(); // done
            } else {
              errorHandler(json.error, json.error_meta, update);
            }
          }
        );
      };
    },
    leaveDiscussion: (boardId, discussionId, userId, resolve, reject) => {
      return (socket, update) => {
        console.log("leaving discussion");
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
            } else {
              errorHandler(json.error, json.error_meta, update);
            }
          }
        );
      };
    },
    getNextChatPage: (boardId, discussionId, endIndex, resolve, reject) => {
      return (socket, update) => {
        if (endIndex == 0) {
          resolve(); // nothing more
        } else {
          socket.emit(
            "load_chat_page",
            {
              board_id: boardId,
              discussion_id: discussionId,
              end_index: endIndex,
            },
            (res) => {
              const json = JSON.parse(res);

              if (!json.error) {
                update((state) => {
                  let units = { ...state.units };
                  let newPage = [];
                  for (const unit of json.chat_page) {
                    newPage.push(unit.id);
                    units[unit.id] = unit;
                  }
                  console.log("new_page", json.end_index, newPage);
                  const chat = newPage.concat(...state.chat);
                  console.log("next_chat_page", chat);
                  return {
                    ...state,
                    chat: chat,
                    endIndex: json.end_index,
                    units: units,
                  };
                });
                resolve(); // done
              } else {
                errorHandler(json.error, json.error_meta, update);
              }
            }
          );
        }
      };
    },
    post: (boardId, discussionId, userId, nickname, text, resolve, reject) => {
      return (socket, update) => {
        console.log("posted", socket.id);

        const tempId = uuid();

        // add the post temporarily
        const newPost = {
          id: tempId,
          pith: text,
          author_name: nickname,
          author_id: userId,
          created: new Date().toISOString(),
        };
        update((state) => {
          return { ...state, temporaryChat: [...state.temporaryChat, newPost] };
        });

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
          {
            board_id: boardId,
            discussion_id: discussionId,
            user_id: userId,
            text: text,
          },
          (res) => {
            const json = JSON.parse(res);
            console.log("received post", json);
            if (!json.error) {
              update((state) => {
                // now we have the real post, so we remove the temporary chat unit
                const newTemporaryChat = [...state.temporaryChat].filter(
                  (post) => {
                    return post.id !== tempId;
                  }
                );

                return {
                  ...state,
                  chat: [...state.chat, json.unit.id],
                  units: { ...state.units, [json.unit.id]: json.unit },
                  temporaryChat: newTemporaryChat,
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
    addPinned: (boardId, discussionId, unitId, resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "add_pinned",
          { board_id: boardId, discussion_id: discussionId, unit_id: unitId },
          (res) => {
            const json = JSON.parse(res);
            if (!json.error) {
              update((state) => {
                if (json.unit) {
                  return {
                    ...state,
                    pinned: [...state.pinned, json.unit.id],
                  };
                } else {
                  return state;
                }
              });
              resolve();
            } else {
              errorHandler(json.error, json.error_meta, update);
            }
          }
        );
      };
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
                pinned = pinned.filter((e) => {
                  return e !== unitId;
                });
                return {
                  ...state,
                  pinned: pinned,
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
                if (json.unit) {
                  //(!state.focused.some((e) => e === unitId)) {
                  return {
                    ...state,
                    focused: [...state.focused, json.unit.id],
                  };
                } else {
                  return state;
                }
              });
              resolve();
            } else {
              errorHandler(json.error, json.error_meta, update);
            }
          }
        );
      };
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
                focused = focused.filter((e) => {
                  return e !== unitId;
                });
                return {
                  ...state,
                  focused: focused,
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
    search: (boardId, discussionId, query, resolve, reject) => {
      return (socket, update) => {
        socket.emit(
          "search",
          { board_id: boardId, discussion_id: discussionId, query: query },
          (res) => {
            const json = JSON.parse(res);
            console.log("search", json.results);
            if (!json.error) {
              update((state) => {
                let units = { ...state.units };
                let searchResults = [];
                for (const unit of json.results) {
                  searchResults.push(unit.id);
                  units[unit.id] = unit;
                }

                return {
                  ...state,
                  searchResults: searchResults,
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
    typingStart: (boardId, discussionId, userId, resolve, reject) => {
      return (socket, update) => {
        console.log("typing start");
        socket.emit(
          "typing_start",
          { board_id: boardId, discussion_id: discussionId, user_id: userId },
          (res) => {
            const json = JSON.parse(res);
            console.log("typing_start", json);

            if (!json.error) {
              //              update((state) => {
              //                let typers = [...state.typers];
              //                typers.push(json.user_id);
              //
              //                return {
              //                  ...state,
              //                  typers: typers,
              //                };
              //              });
              resolve();
            } else {
              errorHandler(json.error, json.error_meta, update);
            }
          }
        );
      };
    },
    typingStop: (boardId, discussionId, userId, resolve, reject) => {
      return (socket, update) => {
        console.log("typing stop");
        socket.emit(
          "typing_stop",
          { board_id: boardId, discussion_id: discussionId, user_id: userId },
          (res) => {
            const json = JSON.parse(res);
            console.log("typing_stop", json);

            if (!json.error) {
              //              update((state) => {
              //                let typers = [...state.typers];
              //                console.log("before", typers, userId);
              //                typers = typers.filter((e) => {
              //                  return e !== json.user_id;
              //                });
              //                console.log("after", typers);
              //
              //                return {
              //                  ...state,
              //                  typers: typers,
              //                };
              //              });
              resolve();
            } else {
              errorHandler(json.error, json.error_meta, update);
            }
          }
        );
      };
    },
    // TODO do below need some ids for the board/room?
    subscribeDiscussion: () => {
      return (socket, update) => {
        console.log("subscribe called");
        socket.on("join_disc", (res) => {
          console.log("joined");
          const json = JSON.parse(res);
          update((state) => {
            return {
              ...state,
              participants: [...state.participants, json.user],
            };
          });
        });
        socket.on("leave_disc", (res) => {
          console.log("left");
        });
      };
    },
    // TODO do below need some ids for the board/room?
    subscribeDiscussion: () => {
      return (socket, update) => {
        console.log("subscribe called");
        socket.on("join_disc", (res) => {
          console.log("joined");
          const json = JSON.parse(res);
          update((state) => {
            return {
              ...state,
              participants: [...state.participants, json.user],
            };
          });
        });
        socket.on("leave_disc", (res) => {
          console.log("left");

          const json = JSON.parse(res);
          update((state) => {
            let participants = [...state.participants];
            participants = participants.filter((e) => {
              return e.id !== json.user.id;
            });
            return {
              ...state,
              participants: participants,
            };
          });
        });

        socket.on("post", (res) => {
          console.log("posted");

          const json = JSON.parse(res);
          console.log("post", json);
          update((state) => {
            return {
              ...state,
              units: { ...state.units, [json.unit.id]: json.unit },
              chat: [...state.chat, json.unit.id],
            };
          });
        });

        socket.on("add_pinned", (res) => {
          console.log("pinned");

          const json = JSON.parse(res);
          update((state) => {
            if (json.unit) {
              return {
                ...state,
                pinned: [...state.pinned, json.unit.id],
              };
            } else {
              return state;
            }
          });
        });
        socket.on("remove_pinned", (res) => {
          console.log("unpinned");

          const json = JSON.parse(res);
          update((state) => {
            let pinned = [...state.pinned];
            // TODO
            pinned = pinned.filter((e) => {
              return e !== json.unit_id;
            });
            return {
              ...state,
              pinned: pinned,
            };
          });
        });

        socket.on("add_focused", (res) => {
          console.log("focused");

          const json = JSON.parse(res);
          update((state) => {
            if (json.unit) {
              return {
                ...state,
                focused: [...state.focused, json.unit.id],
              };
            } else {
              return state;
            }
          });
        });
        socket.on("remove_focused", (res) => {
          console.log("unfocused");

          const json = JSON.parse(res);
          update((state) => {
            let focused = [...state.focused];
            // TODO
            focused = focused.filter((e) => {
              return e !== json.unit_id;
            });
            return {
              ...state,
              focused: focused,
            };
          });
        });

        socket.on("typing_start", (res) => {
          console.log("typing_start");
          const json = JSON.parse(res);

          update((state) => {
            let typers = [...state.typers];
            typers.push(json.user_id);

            return {
              ...state,
              typers: typers,
            };
          });
        });
        socket.on("typing_stop", (res) => {
          console.log("typing_stop");
          const json = JSON.parse(res);

          update((state) => {
            let typers = [...state.typers];
            typers = typers.filter((e) => {
              return e !== json.user_id;
            });

            return {
              ...state,
              typers: typers,
            };
          });
        });
      };
    },
  },
  defaultState
);
