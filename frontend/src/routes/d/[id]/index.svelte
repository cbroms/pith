<script context="module">
	export async function preload({ params }) {
		return { id: params.id };
	}
</script>

<script>
	import { goto } from '@sapper/app';
	import { onMount } from "svelte"

	import { discussionJoinStatus } from "../../../stores/discussionJoinStatus"


	// import { validateDiscussionId } from "../../../api/discussion"
	import { hasUserAlreadyJoinedDiscussion } from "../../../localStorage/utils"

	export let id;



	onMount(async () => {

			discussionJoinStatus.initialize(id)

		console.log("checking discussion is valid")


		// await discuss.checkIsValid()
		// // check if the discussion is a valid Id
		// const isValidDiscussion = await validateDiscussionId(id)

		// if (!isValidDiscussion) await goto("/404")

		console.log("checking join status")

		// // check if the user has already joined the discussion
		// const joined = hasUserAlreadyJoinedDiscussion(id);

		// if (!joined) { 
		// 	await goto(`/d/${id}/join`);
		// }

		// console.log("load discusion")
		// the user has joined the discussion, so load in the data
		// loadDiscussionData()

	})
</script>

<div>{$discussionJoinStatus}</div>

<!-- {#if joined}
<div >
	Welcome to discussion {id}
</div>
{:else }
<div >
	Loading...
</div>
{/if} -->