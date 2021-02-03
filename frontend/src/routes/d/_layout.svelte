<script>
	import { onMount } from "svelte";
	import { stores } from "@sapper/app";
	import { discussionSocket as socket } from "../../stores/socket.js";

	const { session } = stores();
	const { BACKEND_HOST, BACKEND_PORT } = $session;

	onMount(async () => {
		socket.initialize(BACKEND_HOST, BACKEND_PORT, "discussion");
	});
</script>

<div>
	<div>Connected to server: {$socket.connected}</div>
	<slot></slot>
</div>
