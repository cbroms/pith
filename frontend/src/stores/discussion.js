import { derived } from "svelte/store";
import { discussionSocket as socket } from "./socket";

import { writable, readable } from "svelte/store";
import { awaitedStore } from "./awaitedStore";

export const discussionIsValid = awaitedStore(
	socket,
	(socketObj) => {
		return readable(false, (set) => {
			if (socketObj !== null && socketObj.connected) {
				socketObj.emit("test_connect", { discussion_id: 23 }, (res) => {
					console.log(res);
					// set(true);
				});
			}
		});
	},
	undefined
);

// export const discussionIsValid = derived(
// 	socket,
// 	($socket, set) => {
// 		if ($socket !== null) {
// 			$socket.emit("test_connect", { discussion_id: id }, (res) => {
// 				console.log(res);
// 			});
// 		}
// 	},
// 	null
// );

// // the discussion store is derived from the socket, which should be in a connected state
// export const discussion = (id, socket) => {
// 	console.log(socket);
// 	const defaultState = {
// 		id: "",
// 		isValid: null,
// 		socket: null,
// 	};

// 	const discussionStore = writable(defaultState);

// 	// const derivedSocket = derived(socket, ($socket) => $socket, null);

// 	const checkIsValid = async () => {
// 		return new Promise((resolve, reject) => {
// 			// socket.emit("test_connect", { discussion_id: id }, (res) => {
// 			// 	console.log(res);
// 			// 	resolve(res);
// 			// });
// 		});
// 	};

// 	return {
// 		set: discussionStore.set,
// 		subscribe: discussionStore.subscribe,
// 		checkIsValid,
// 	};
// };

// export const discussion = derived(
// 	socket,
// 	($socket, set) => {
// 		if ($socket !== null) {
// 			$socket.on("connect", () => {
// 				set(true);
// 			});
// 			$socket.on("disconnect", () => {
// 				set(false);
// 			});
// 		}
// 	},
// 	false
// );
