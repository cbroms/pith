<script>
	import Document from "../components/document/Document.svelte"
  	import { test } from "../stores/connect.js"

  	function testConnect() {
  		test();
  	}

 </script>

<style>

</style>

<svelte:head>
	<title>Pith</title>
</svelte:head>


<button on:click={testConnect}>test</button>


<Document />
