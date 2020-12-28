import { derived } from "svelte/store";
import { socket } from "./socket";

export const connectionStatus = derived(
	socket,
	($socket, set) => {
		if ($socket !== null) {
			$socket.on("connect", () => {
				set(true);
			});
			$socket.on("disconnect", () => {
				set(false);
			});
		}
	},
	false
);
