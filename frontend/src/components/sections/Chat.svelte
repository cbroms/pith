<script>
  import { beforeUpdate, afterUpdate, onMount } from "svelte";

  import { discussionStore } from "../../stores/discussionStore";
  import { boardStore } from "../../stores/boardStore";
  import BoardLayout from "../layouts/BoardLayout.svelte";

  import ChatUnit from "../unit/ChatUnit.svelte";
  import Board from "./Board.svelte";

  export let id;

  let div;
  let autoscroll;

  let prevNumMessages = $discussionStore.chat.length;
  let missedMessages = 0;

  beforeUpdate(() => {
    autoscroll =
      div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
  });

  afterUpdate(() => {
    if (autoscroll) div.scrollTo(0, div.scrollHeight);
    else if (prevNumMessages < $discussionStore.chat.length) {
      // add an indication that a message was missed
      missedMessages += 1;
      prevNumMessages = messages.length;
    }
  });

  onMount(() => {
    // add messages at a regular interval for testing purposes
    // window.setInterval(() => {
    //     messages = [...messages, messages[0]];
    // }, 2000);
  });

  const handleScroll = () => {
    if (
      missedMessages > 0 &&
      Math.abs(div.scrollHeight - div.scrollTop - div.clientHeight) <= 5
    ) {
      missedMessages = 0;
    }
  };

  let content = "";

  const onSubmit = () => {
    if (content !== "") {
      discussionStore.post(
        $boardStore.boardId,
        id,
        $boardStore.userId,
        $boardStore.nickname,
        content
      );
      content = "";
    }
  };

  const onKeydown = (e) => {
    if (e.key === "Enter") onSubmit();
  };
</script>

<div class="chat-wrapper">
  <div class="chat-overflow" bind:this={div} on:scroll={handleScroll}>
    <div class="chat">
      {#each $discussionStore.chat as message}
        <ChatUnit {...message} />
      {/each}
      {#each $discussionStore.temporaryChat as message}
        <ChatUnit {...message} />
      {/each}
    </div>
  </div>

  <div class="chat-base">
    {#if missedMessages > 0}
      <div class="chat-missed-messages">
        Missed messages: {missedMessages}
      </div>
    {/if}

    <input
      placeholder="type a message..."
      bind:value={content}
      on:keydown={onKeydown}
    />
  </div>
</div>

<!--<script ✂prettier:content✂="CglpbXBvcnQgeyBjaGF0IH0gZnJvbSAiLi4vLi4vc3RvcmVzL2NoYXQiOwoJaW1wb3J0IHsgZGlzY3Vzc2lvbkpvaW5TdGF0dXMgfSBmcm9tICIuLi8uLi9zdG9yZXMvZGlzY3Vzc2lvbkpvaW5TdGF0dXMiOwoKCWltcG9ydCBDaGF0TWVzc2FnZSBmcm9tICIuL0NoYXRNZXNzYWdlLnN2ZWx0ZSI7CgoJbGV0IGNvbnRlbnQgPSAiIjsKCgljb25zdCBvblN1Ym1pdCA9ICgpID0+IHsKCQlpZiAoY29udGVudCAhPT0gIiIpIHsKCQkJY2hhdC5tYWtlUG9zdChjb250ZW50LCAkZGlzY3Vzc2lvbkpvaW5TdGF0dXMubmlja25hbWUpOwoJCQljb250ZW50ID0gIiI7CgkJfQoJfTsKCgljb25zdCBvbktleWRvd24gPSAoZSkgPT4gewoJCWlmIChlLmtleSA9PT0gIkVudGVyIikgb25TdWJtaXQoKTsKCX07Cg==" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=" ✂prettier:content✂="e30=">{}</script><div>
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
<style>
  .chat-overflow {
    height: 100%;
    overflow-y: auto;
    position: relative;
    grid-row: 1 / 2;
  }

  .chat {
    position: absolute;
    min-height: 100%;
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    align-content: flex-end;
    width: 100%;
  }

  .chat-wrapper {
    display: grid;
    grid-template-rows: 1fr auto;
    height: 100%;
  }

  .chat-base {
    grid-row: 2 / 3;
    margin-top: 20px;
  }
</style>
