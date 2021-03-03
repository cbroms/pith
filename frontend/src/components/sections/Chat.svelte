<script>
  import { beforeUpdate, afterUpdate, onMount } from "svelte";

  import { discussionStore } from "../../stores/discussionStore";
  import { boardStore } from "../../stores/boardStore";

  import ChatUnit from "../unit/ChatUnit.svelte";

  export let id;

  let div;
  let autoscroll;
  let loadingNext = false;
  let checkTimeout = null;
  let makeSearchTimeout = null;
  let query = "";
  let justSearchedQuery = "";
  let isSearching = false;

  let prevNumMessages = $discussionStore.chat.length;
  let missedMessages = 0;

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

    // check for changed content and extract a query
    const start = content.lastIndexOf("[[");
    const end = content.lastIndexOf("]]");
    if (start !== -1 && (end === -1 || start > end)) {
      query = content.substring(start + 2).replace("]", "");

      if (query === "") isSearching = true;

      if (justSearchedQuery !== query) {
        clearTimeout(makeSearchTimeout);
        makeSearchTimeout = setTimeout(() => {
          discussionStore.search(
            $boardStore.boardId,
            $discussionStore.discussionId,
            query
          );
          justSearchedQuery = query;
        }, 500);
      }
    } else if (isSearching) {
      isSearching = false;
    }
  });

  onMount(() => {
    prevNumMessages = $discussionStore.chat.length;
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

  const selectedSearchResult = (id) => {
    isSearching = false;
    content = content.replace(query, id + "]]");
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

    {#if isSearching}
      <div class="chat-search-results">
        <h3>Search Results</h3>
        {#if justSearchedQuery !== query}
          <p>Searching...</p>
        {:else if $discussionStore.searchResults.length === 0}
          <p>No results</p>
        {:else}
          {#each $discussionStore.searchResults as resultId (resultId)}
            <ChatUnit
              {...$discussionStore.units[resultId]}
              searchResult
              onClick={() => selectedSearchResult(resultId)}
            />
          {/each}
        {/if}
      </div>
    {/if}

    <input
      placeholder="type a message..."
      bind:value={content}
      on:keydown={onKeydown}
    />
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

  .chat-search-results {
    padding-bottom: 20px;
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
