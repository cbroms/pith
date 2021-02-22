import { derived } from "svelte/store";

// create a store that derives from the socket store and keeps a custom state that's updated
// using emit/on functions from the socket object.

// `functions` is an object containing all of the methods the store should have. Function names
// are the keys and the values are the functions. Each function should return a callback that takes
// a socket object, an update function, and a set function.
// For example, to define an initalize function, `functions` might be:
/* 
	{ 
		initialize: (caller, customArg1, customArg2) => {

			// the caller will feed in the socket object and set function to a callback 
			return (socket, update, set) => {

				// do something with the socket and then set the state, for examle:
				socket.emit("blah", { foo: customArg1, bar: customArg2 }, (res) => {
					set(res)
				})
			}
		}
	}
*/
// Then, we can get the store and call the initialize function from the component:
/*
	customStore.initialize("someArg1", "someArg2");
*/
// each method in the new store returns a promise, so if needed you can define where the
// promise should resolve and then await the method. For example, in the same example above:
/* 
	{ 
		initialize: (caller, customArg1, customArg2, resolve, reject) => {

			// the caller will feed in the socket object and set function to a callback 
			return (socket, update, set) => {

				// do something with the socket and then set the state, for examle:
				socket.emit("blah", { foo: customArg1, bar: customArg2 }, (res) => {
					set(res)
					resolve()
				})
			}
		}
	}
*/
// Then, you can await the function to resolve:
/*
	await customStore.initialize("someArg1", "someArg2");
*/

export const createDerivedSocketStore = (
	socket,
	functions = {},
	defaultState = null
) => {
	// store a copy of the socket object locally to make emits
	let localSocket = null;
	let localSet = () => {};
	let localUpdate = () => {};
	// a queue for all the work we want to do as soon as the socket is connected
	let execQueue = [];
	// the state of the store
	let localState = defaultState;

	const setStateCopy = (newState) => {
		if (newState === null) throw new Error("State cannot be null.");
		localState = newState;
	};

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
                    func(localSocket, localUpdate, localSet);
				} catch (e) {
					console.error("Function failed to execute: ", func);
					console.error(e);
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
			if ($socket !== null && $socket.connected && localSocket === null) {
				// get the latest socket object
				localSocket = $socket;
				localSet = (val) => {
					setStateCopy(val);
					set(val);
				};
				localUpdate = (func) => localSet(func(localState));
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

		// wrap the function so it adds the callback to the queue rather than immediately executing
		const wrappedFunc = (...args) => {
			return new Promise((resolve, reject) => {
				// call the function with the arguments the wrapper receives
                // expect that this will return a new function we can pass the socket obj to
                try {
                    const modifierFunc = func(...args, resolve, reject);
                    addToQueue(modifierFunc);
                } catch(e) {
                    console.error(e)
                }
			});
		};
		// add the wrapped function to the methods object
		storeMethods[funcName] = wrappedFunc;
	}

	return {
		...storeMethods,
		subscribe: socketStore.subscribe,
	};
};
