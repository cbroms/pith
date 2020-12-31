import { derived, writable } from "svelte/store";
import { discussionSocket as socket } from "./socket";

// create a store that derives from the socket store and keeps a custom state that's updated
// using emit/on functions from the socket object.

// `functions` is an object containing all of the methods the store should have. Function names
// are the keys and the values are the functions. Each function should take as the first
// parameter a "caller" which is used to access the socket object and store `set` function.
// For example, to define an initalize function, `functions` might be:
/* 
	{ 
		initialize: (caller, customArg1, customArg2) => {

			// the caller will feed in the socket object and set function to a callback 
			caller((socket, set) => {

				// do something with the socket and then set the state, for examle:
				socket.emit("blah", { foo: customArg1, bar: customArg2 }, (res) => {
					set(res)
				})
			})
		}
	}
*/
// Then, we can get the store and call the initialize function from the component:
/*
	customStore.initialize("someArg1", "someArg2");
*/
export const createDerivedSocketStore = (
	functions = {},
	defaultState = null
) => {
	// store a copy of the socket object locally to make emits
	let localSocket = null;
	let localSet = null;
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
					func(localSocket, localSet);
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

	// this is the derived store we will return with custom methods attached
	const socketStore = derived(
		socket,
		($socket, set) => {
			// when the socket connection status changes, update the local socket object
			if ($socket.connected) {
				// get the latest socket object
				localSocket = $socket;
				localSet = set;
				// run the functions in the queue
				tryToRunExecQueue();
			}
		},
		defaultState
	);

	const storeMethods = {};

	// create wrappers for the custom functions
	for (const funcName in functions) {
		// get the function from the object
		const func = functions[funcName];

		// create a wrapped version that passes the addToQueue function
		const wrappedFunc = (...args) => {
			func(addToQueue, ...args);
		};
		// add the wrapped function to the methods object
		storeMethods[funcName] = wrappedFunc;
	}

	return {
		...storeMethods,
		subscribe: socketStore.subscribe,
	};
};
