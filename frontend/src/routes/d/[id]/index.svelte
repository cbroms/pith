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

	onMount(async () => {
		await discussionJoinStatus.initialize(id);
		
		// check if the user has already joined the discussion
		if ($discussionJoinStatus.isValidDiscussion && $discussionJoinStatus.hasJoinedDiscussion === false) {
			await goto(`/d/${id}/join`);
		}

		// console.log("load discusion")
		// the user has joined the discussion, so load in the data
		// loadDiscussionData()
	});
</script>

<div>Discussion is valid: {$discussionJoinStatus.isValidDiscussion}</div>
<div>Discussion is joined: {$discussionJoinStatus.hasJoinedDiscussion}</div>
<!-- {#if joined}
<div >
	Welcome to discussion {id}
</div>
{:else }
<div >
	Loading...
</div>
{/if} -->
