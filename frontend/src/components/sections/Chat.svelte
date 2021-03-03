<script>
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from "svelte";

  import { discussionStore } from "../../stores/discussionStore";
  import { boardStore } from "../../stores/boardStore";

  import ChatUnit from "../unit/ChatUnit.svelte";
  import UnitEditor from "../inputs/UnitEditor.svelte";

  export let id;

  let div;
  let autoscroll;
  let loadingNext = false;
  let checkTimeout = null;

  let prevNumMessages = $discussionStore.chat.length;
  let missedMessages = 0;

  onMount(() => {
    prevNumMessages = $discussionStore.chat.length;
  });

  beforeUpdate(() => {
    autoscroll =
      div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
  });

  afterUpdate(() => {
    if (autoscroll) {
      div.scrollTo(0, div.scrollHeight);
      // do it again 500 ms later in case the dom has not finished updating
      checkTimeout = setTimeout(() => {
        if (autoscroll) div.scrollTo(0, div.scrollHeight);
      }, 500);
    } else if (prevNumMessages < $discussionStore.chat.length) {
      // add an indication that a message was missed
      missedMessages += 1;
      prevNumMessages = $discussionStore.chat.length;
    }
  });

  onDestroy(() => {
    clearTimeout(checkTimeout);
  });

  const handleScroll = async () => {
    if (
      missedMessages > 0 &&
      Math.abs(div.scrollHeight - div.scrollTop - div.clientHeight) <= 5
    ) {
      missedMessages = 0;
    }

    if (div.scrollTop === 0) {
      loadingNext = true;

      await discussionStore.getNextChatPage(
        $boardStore.boardId,
        $discussionStore.discussionId,
        $discussionStore.endIndex
      );

      loadingNext = false;
    }
  };

  const onSubmit = (content) => {
    if (content !== "") {
      discussionStore.post(
        $boardStore.boardId,
        id,
        $boardStore.userId,
        $boardStore.nickname,
        content
      );
    }
  };
</script>

<div class="chat-wrapper">
  <div class="chat-overflow" bind:this={div} on:scroll={handleScroll}>
    <div class="chat">
      {#if loadingNext}
        Loading older messages...
      {/if}
      {#if $discussionStore.chat.length === 0 && $discussionStore.temporaryChat.length === 0}
        <p>No messages yet!</p>
      {/if}
      {#each $discussionStore.chat as unitId, i (unitId)}
        <ChatUnit
          {...$discussionStore.units[unitId]}
          prev={i > 0
            ? $discussionStore.units[$discussionStore.chat[i - 1]]
            : null}
        />
      {/each}
      {#each $discussionStore.temporaryChat as message, i}
        <ChatUnit
          {...message}
          prev={i > 0
            ? $discussionStore.temporaryChat[i - 1]
            : $discussionStore.units[
                $discussionStore.chat[$discussionStore.chat.length - 1]
              ]}
        />
      {/each}
    </div>
  </div>

  <div class="chat-base">
    {#if missedMessages > 0}
      <div class="chat-missed-messages">
        Missed messages: {missedMessages}
      </div>
    {/if}
    <UnitEditor {onSubmit} placeholder="type a message..." />
  </div>
</div>

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
