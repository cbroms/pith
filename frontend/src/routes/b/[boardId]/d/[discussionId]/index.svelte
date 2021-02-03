<script context="module">
	export async function preload({ params }) {
		return { id: params.discussionId };
	}
</script>

<script>
	import { goto } from "@sapper/app";
	import { onMount } from "svelte";

	import Chat from "../../../../../components/chat/Chat.svelte"

	import { discussionStore } from "../../../../../stores/discussionStore";

	export let id;

	onMount(async () => {
		await discussionStore.initialize(id);
	});
</script>

<div>Discussion {id}</div>
