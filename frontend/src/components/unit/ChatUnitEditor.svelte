<script>
  import { fade } from "svelte/transition";

  import { boardStore } from "../../stores/boardStore";
  import { discussionStore } from "../../stores/discussionStore";

  import ChatUnit from "./ChatUnit.svelte";
  import UnitEditor from "../inputs/UnitEditor.svelte";

  export let onSubmit = () => {};
  export let onCancel = () => {};
  export let noBorder = false;

  let typingDetectionTimeout = null;
  let flairs = [];

  const onSearch = (query) => {
    discussionStore.search(
      $boardStore.boardId,
      $discussionStore.discussionId,
      query
    );
  };

  const toggleFlair = (flair) => {
    if (flairs.includes(flair)) {
      flairs = flairs.filter((f) => {
        return f !== flair;
      });
    } else {
      flairs = [...flairs, flair];
    }
  };

  const stopTyping = () => {
    if (typingDetectionTimeout) {
      clearTimeout(typingDetectionTimeout);

      discussionStore.typingStop(
        $boardStore.boardId,
        $discussionStore.discussionId,
        $boardStore.userId
      );

      typingDetectionTimeout = null;
    }
  };

  const onTyped = () => {
    if (typingDetectionTimeout === null) {
      // started typing
      discussionStore.typingStart(
        $boardStore.boardId,
        $discussionStore.discussionId,
        $boardStore.userId
      );
    }
    clearTimeout(typingDetectionTimeout);
    typingDetectionTimeout = setTimeout(() => {
      // stopped typing
      stopTyping();
    }, 800); // send stop signal 800 ms after last keystroke
  };
</script>

<div class="typing-indicator">
  {#if $discussionStore.typers.length > 0}
    <div transition:fade>
      {#each $discussionStore.typers as typer (typer)}
        <div class="bouncing-ball">
          <div class="ball" />
        </div>
      {/each}
    </div>
  {/if}
</div>
<UnitEditor
  onSubmit={(e) => {
    stopTyping();
    onSubmit(e, flairs);
    flairs = [];
  }}
  {onCancel}
  {noBorder}
  {onSearch}
  noResults={$discussionStore.searchResults.length === 0}
  placeholder="type a message..."
  slideUp
  on:typed={onTyped}
>
  <div slot="search-results" let:onSelectResult>
    {#each $discussionStore.searchResults as resultId (resultId)}
      <ChatUnit
        {...$discussionStore.units[resultId]}
        searchResult
        onClick={() => onSelectResult(resultId)}
      />
    {/each}
  </div>
</UnitEditor>
{#each $discussionStore.flairs as flair (flair)}
  <button
    class:flair-selected={flairs.includes(flair)}
    on:click={() => toggleFlair(flair)}>{flair}</button
  >
{/each}

<style>
  .typing-indicator {
    height: 20px;
    margin-bottom: 5px;
  }

  button {
    border: 1px solid;
    margin-top: 10px;
    margin-right: 5px;
    padding: 2px 5px;
    text-decoration: none;
  }

  .flair-selected {
    background-color: black;
    color: white;
  }

  /* .typing-text {
    font-size: 12px;
    display: inline-block;
  } */

  .bouncing-ball {
    height: 15px;
    font-size: 20px;
    position: relative;
    display: inline-block;
  }

  .ball::before {
    content: "•";
  }

  .ball {
    height: 15px;
    width: 10px;
    position: absolute;
    bottom: 5px;
    animation-duration: 0.5s;
    animation-name: bounce;
    animation-iteration-count: infinite;
    animation-timing-function: ease-out;
    animation-direction: alternate;
  }

  @keyframes bounce {
    from {
      bottom: 0px;
    }

    to {
      bottom: 10px;
    }
  }
</style>
