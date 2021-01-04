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

		if (
			$discussionJoinStatus.isValidDiscussion &&
			$discussionJoinStatus.hasJoinedDiscussion === false &&
			$discussionJoinStatus.userId === null
		) {
			// make a user ID first
			await goto(`/d/${id}/join`);
		}
		else if ($discussionJoinStatus.isValidDiscussion && $discussionJoinStatus.userId !== null) {
			// try joining the discussion with the user ID 
			await discussionJoinStatus.joinDiscussion(id, $discussionJoinStatus.userId)
		}

		// console.log("load discusion")
		// the user has joined the discussion, so load in the data
		// loadDiscussionData()
	});
</script>

<!-- <div>Discussion is valid: {$discussionJoinStatus.isValidDiscussion}</div>
<div>Discussion is joined: {$discussionJoinStatus.hasJoinedDiscussion}</div>
 -->
{#if $discussionJoinStatus.isValidDiscussion === false}
<div>
	<h1>That discussion doesn't exist</h1>
</div>
{:else if $discussionJoinStatus.isValidDiscussion &&
$discussionJoinStatus.hasJoinedDiscussion}
<div>
	<h1>Welcome to discussion {id}</h1>
</div>
{:else }
<div>
	Loading...
</div>
{/if}
