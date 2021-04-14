<script>
  import {
    afterUpdate,
    onDestroy,
    onMount,
    createEventDispatcher,
  } from "svelte";

  import { slide } from "svelte/transition";

  export let onSubmit = () => {};
  export let onCancel = () => {};
  export let onSearch = () => {};
  export let content = "";
  export let noResults = true;
  export let placeholder = "type something...";
  export let noBorder = false;
  export let submitOnClickOff = false;
  export let slideUp = false;

  const dispatch = createEventDispatcher();

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
          onSearch(query);
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

    dispatch("typed", true);
  };

  const onSelectResult = (id) => {
    isSearching = false;
    content = content.replace(query, id + "]]");
    editorElement.focus();
  };

  const onBlur = () => {
    if (submitOnClickOff) {
      onSubmit(content);
    }
  };
</script>

{#if isSearching}
  <div class="search-results" class:slide={slideUp} transition:slide>
    <h3>Search Results</h3>
    {#if justSearchedQuery !== query}
      <p>Searching...</p>
    {:else if noResults}
      <p>No results</p>
    {:else}
      <slot name="search-results" {onSelectResult} />
    {/if}
  </div>
{/if}

<input
  class:borderless={noBorder}
  {placeholder}
  bind:value={content}
  on:blur={onBlur}
  on:keydown={onKeydown}
  bind:this={editorElement}
/>

<style>
  .slide {
    border-top: 1px solid;
    height: 300px;
    overflow-y: scroll;
  }

  .search-results {
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
