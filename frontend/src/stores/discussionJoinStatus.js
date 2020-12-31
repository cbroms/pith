import { derived, writable } from "svelte/store";
import { discussionSocket as socket } from "./socket";

const createSocketWorkQueue = () => {
	// store a copy of the socket object locally to make emits
	let localSocket = null;
	// a queue for all the work we want to do as soon as the socket is connected
	let execQueue = [];

	// run the functions in the queue
	const tryToRunExecQueue = () => {
		// only run the queue if the socket is valid and there are functions
		if (
			localSocket !== null &&
			localSocket.connected &&
			execQueue.length > 0
		) {
			// make a copy of the functions in the queue then reset it
			const queueCopy = [...execQueue];
			execQueue = [];

			// try running the functions
			for (const func of queueCopy) {
				try {
					func(localSocket);
				} catch {
					console.error("function failed to execute: ", func);
				}
			}
		}
	};

	// add a function to the exec queue
	const addToQueue = (func) => {
		execQueue.push(func);
		tryToRunExecQueue();
	};

	// const { subscribe, set, update } = writable(null);

	// when the socket connection status changes, update the local socket object
	const socketStore = derived(
		socket,
		($socket, set) => {
			if ($socket.connected) {
				// get the latest socket object
				localSocket = $socket;
				// run the functions in the queue
				tryToRunExecQueue();
			}
		},
		false
	);

	const initialize = (discussionId) => {
		// add the check function to the queue
		addToQueue((socket) => {
			console.log(
				"checking is valid with id ",
				discussionId,
				" and socket ",
				socket
			);
			//	socket.emit()
		});
	};

	return {
		subscribe: socketStore.subscribe,
		initialize,
	};
};

export const discussionJoinStatus = createSocketWorkQueue();
