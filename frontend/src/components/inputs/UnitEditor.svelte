<script>
  import { discussionStore } from "../../stores/discussionStore";
  import { boardStore } from "../../stores/boardStore";

  import { afterUpdate, onDestroy, onMount } from "svelte";

  import ChatUnit from "../unit/ChatUnit.svelte";

  export let onSubmit = () => {};
  export let onCancel = () => {};
  export let content = "";
  export let placeholder = "type something...";
  export let noBorder = false;

  let makeSearchTimeout = null;
  let query = "";
  let justSearchedQuery = "";
  let isSearching = false;

  let editorElement = null;

  onMount(() => {
    editorElement.focus();
  });

  afterUpdate(() => {
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

  onDestroy(() => {
    clearTimeout(makeSearchTimeout);
  });

  const onKeydown = (e) => {
    if (e.key === "Enter") {
      onSubmit(content);
      content = "";
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const selectedSearchResult = (id) => {
    isSearching = false;
    content = content.replace(query, id + "]]");
  };
</script>

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
  class:borderless={noBorder}
  {placeholder}
  bind:value={content}
  on:keydown={onKeydown}
  bind:this={editorElement}
/>

<style>
  .chat-search-results {
    padding-bottom: 20px;
  }

  .borderless {
    padding: 0;
    border: none;
    padding-bottom: 5px;
  }

  .borderless:focus {
    border-bottom: 1px solid;
  }
</style>
