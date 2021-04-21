<script>
  import { beforeUpdate, afterUpdate, onMount, onDestroy } from "svelte";

  import { discussionStore } from "../../stores/discussionStore";
  import { boardStore } from "../../stores/boardStore";

  import ChatUnit from "../unit/ChatUnit.svelte";
  import ChatUnitEditor from "../unit/ChatUnitEditor.svelte";

  export let id;

  let div;
  let autoscroll;
  let loadingNext = false;
  let checkTimeout = null;

  let prevNumMessages = $discussionStore.chat.length;
  let missedMessages = 0;

  const adjustScrollPosition = () => {
    if (autoscroll) {
      div.scrollTo(0, div.scrollHeight);
      // do it again 500 ms later in case the dom has not finished updating
      checkTimeout = setTimeout(() => {
        if (autoscroll) div.scrollTo(0, div.scrollHeight);
      }, 500);
    }
  };

  onMount(() => {
    prevNumMessages = $discussionStore.chat.length;
  });

  beforeUpdate(() => {
    autoscroll =
      div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
    if (!autoscroll && prevNumMessages < $discussionStore.chat.length) {
      // add an indication that a message was missed
      missedMessages += 1;
      prevNumMessages = $discussionStore.chat.length;
    }
  });

  afterUpdate(() => {
    adjustScrollPosition();
  });

  onDestroy(() => {
    clearTimeout(checkTimeout);
  });

  $: {
    // if (chatHeight !== prevChatHeight && div) {
    //   console.log(chatHeight, prevChatHeight);
    //   // TODO: don't force the chat to the bottom when adjusting the size
    //   //  do it more intelligently and keep the position if necessary otherwise
    //   // scroll to the bottom (this happens when searching or looking at participants)
    //   div.scrollTo(0, div.scrollHeight);
    //   prevChatHeight = chatHeight;
    //   //   autoscroll =
    //   //     div && div.offsetHeight + div.scrollTop > div.scrollHeight - 25;
    //   //   console.log(autoscroll);
    //   //   adjustScrollPosition();
    // }
  }

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

  const onSubmit = (content, flairs) => {
    if (content !== "") {
      discussionStore.post(
        $boardStore.boardId,
        id,
        $boardStore.userId,
        $boardStore.nickname,
        content,
        flairs
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
          pin={false}
          {...$discussionStore.units[unitId]}
          prev={i > 0
            ? $discussionStore.units[$discussionStore.chat[i - 1]]
            : null}
        />
      {/each}
      {#each $discussionStore.temporaryChat as message, i}
        <ChatUnit
          pin={false}
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
      <button
        on:click={() => {
          div.scrollTo(0, div.scrollHeight);
        }}
        class="chat-missed-messages">&darr;</button
      >
    {/if}
    <ChatUnitEditor {onSubmit} />
  </div>
</div>

<style>
  .chat-overflow {
    height: 100%;
    overflow-y: auto;
    position: relative;
    grid-row: 1 / 2;
  }

  .chat-missed-messages {
    position: absolute;
    top: -45px;
    right: 0px;
    background-color: black;
    color: white;
    text-decoration: none;
    padding: 10px;
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
    margin-top: 10px;
    position: relative;
  }
</style>
