<script>
	import { onMount } from 'svelte';
	import { stores } from "@sapper/app";
	import { socket } from "../stores/socket.js"
	import { connectionStatus } from "../stores/connectionStatus"

	const { session } = stores();
	const { BACKEND_HOST, BACKEND_PORT } = $session;
	

  	onMount(async () => { 
  		socket.initialize(BACKEND_HOST, BACKEND_PORT, "discussion")
	});


</script>


<main>
	<div>{$connectionStatus}</div>
	<slot></slot>
</main>