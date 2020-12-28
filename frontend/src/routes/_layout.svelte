<script>
	import { onMount } from 'svelte';
	import { stores } from '@sapper/app';
  	const { session } = stores();
  	const { BACKEND_HOST, BACKEND_PORT } = $session;

  	import { connect } from "../stores/connect.js"

  	onMount(async () => { 
  		console.log("mounting")
  		connect(BACKEND_HOST, BACKEND_PORT)
	});


</script>


<main>
	<slot></slot>
</main>