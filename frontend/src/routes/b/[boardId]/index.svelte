<script context="module">
	export async function preload({ params }) {
		return { id: params.boardId };
	}
</script>

<script>
	import { goto } from "@sapper/app";
	import { onMount } from "svelte";

	import { boardStore } from "../../../stores/boardStore";

	export let id;

	onMount(async () => {
		await boardStore.initialize(id);

		if (
			$boardStore.isValidBoard &&
			$boardStore.hasJoinedBoard === false &&
			$boardStore.userId === null
		) {
			// make a user ID first
			await goto(`/b/${id}/join`);
		} else if (
			$boardStore.isValidBoard &&
			$boardStore.userId !== null
		) {
			// try joining the board with the user ID
			await boardStore.joinBoard(
				id,
				$boardStore.userId
			);
		}

	});
</script>

<!-- <div>Board is valid: {$boardStore.isValidBoard}</div>
<div>Board is joined: {$boardStore.hasJoinedBoard}</div>
 -->
{#if $boardStore.isValidBoard === false}
<div>
	<h1>That board doesn't exist</h1>
</div>
{:else if $boardStore.isValidBoard &&
$boardStore.hasJoinedBoard}
<div>
	<h1>Welcome to board {id}</h1>
</div>
{:else }
<div>Loading...</div>
{/if}
