<script context="module">
	export async function preload({ params }) {
		return { id: params.id };
	}
</script>

<script>
	import { goto } from "@sapper/app";
	import { onMount } from "svelte";

	import { discussionJoinStatus } from "../../../stores/discussionJoinStatus";

	export let id;

	let name = "";
	let error = false;

	onMount(async () => {
		if ($discussionJoinStatus.isValidDiscussion === null) {
			// if we have arrived at this route directly, go back to the index
			await goto(`/d/${id}/`);
		}
	});

	const submitNickname = (name) => {
		discussionJoinStatus.createUser(id, name).then(
			async () => {
				// we created the user sucessfully
				await goto(`/d/${id}/`);
			},
			(msg) => {
				// the nickname was taken, try again
				error = true;
				console.info(msg);
			}
		);
	};

	const onSubmit = () => {
		submitNickname(name);
		name = "";
		error = false;
	};

	const onKeydown = (e) => {
		if (e.key === "Enter") onSubmit();
	};
</script>

{#if $discussionJoinStatus.isValidDiscussion}
<div>
	<h1>Create a nickname</h1>
	<p>
		Your nickname will be used to identify your contributions in the
		discussion.
	</p>
	<input
		placeholder="type a nickname..."
		bind:value="{name}"
		on:keydown="{onKeydown}"
	/>
	<button on:click="{onSubmit}">Join Discussion</button>

	{#if error}
	<div>{$discussionJoinStatus.nickname} is already taken</div>
	{:else if $discussionJoinStatus.nickname !== null &&
	$discussionJoinStatus.userId === null}
	<div>Joining as {$discussionJoinStatus.nickname}...</div>
	{/if}
</div>
{/if}
