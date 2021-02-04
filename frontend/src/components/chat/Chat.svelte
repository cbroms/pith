<!--<script>
	import { chat } from "../../stores/chat";
	import { discussionJoinStatus } from "../../stores/discussionJoinStatus";

	import ChatMessage from "./ChatMessage.svelte";

	let content = "";

	const onSubmit = () => {
		if (content !== "") {
			chat.makePost(content, $discussionJoinStatus.nickname);
			content = "";
		}
	};

	const onKeydown = (e) => {
		if (e.key === "Enter") onSubmit();
	};
</script><div>
	{#each $chat.messages as message}
	<ChatMessage {...$chat.messagesContent[message]} />
	{/each} {#each $chat.pendingMessages as message}
	<ChatMessage {...$chat.messagesContent[message]} />
	{/each}
	<input
		placeholder="type a message..."
		bind:value="{content}"
		on:keydown="{onKeydown}"
	/>
</div> -->
