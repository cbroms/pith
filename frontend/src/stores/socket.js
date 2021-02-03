import io from "socket.io-client";
import { writable } from "svelte/store";

const createSocket = () => {
	const { subscribe, set, update } = writable({
		disonnected: false,
		connected: false,
	});

	const initialize = (host, port, namespace) => {
		const socket = io.connect(`ws://${host}:${port}/${namespace}`, {
			reconnect: true,
		});

		socket.on("connect", () => {
			set(socket);
		});

		socket.on("disconnect", () => {
			set(socket);
		});

		set(socket);
	};

	return {
		subscribe,
		initialize,
	};
};

export const discussionSocket = createSocket();
export const boardSocket = createSocket();
