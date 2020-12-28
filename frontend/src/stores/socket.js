import io from "socket.io-client";
import { writable } from "svelte/store";

const createSocket = () => {
	const { subscribe, set, update } = writable(null);

	const initialize = (host, port, namespace) => {
		const socket = io.connect(`ws://${host}:${port}/${namespace}`, {
			reconnect: true,
		});
		set(socket);
	};

	return {
		subscribe,
		initialize: initialize,
		reset: () => set(null),
	};
};

export const socket = createSocket();
