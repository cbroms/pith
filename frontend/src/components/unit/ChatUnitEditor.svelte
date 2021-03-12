<script>
  import { boardStore } from "../../stores/boardStore";
  import { discussionStore } from "../../stores/discussionStore";

  import ChatUnit from "./ChatUnit.svelte";
  import UnitEditor from "../inputs/UnitEditor.svelte";

  export let onSubmit = () => {};
  export let onCancel = () => {};
  export let noBorder = false;

  let typingDetectionTimeout = null;

  const onSearch = (query) => {
    discussionStore.search(
      $boardStore.boardId,
      $discussionStore.discussionId,
      query
    );
  };

  const onTyped = () => {
    if (typingDetectionTimeout === null) {
      // started typing
      discussionStore.typingStart(
        $boardStore.boardId,
        $discussionStore.discussionId,
        $boardStore.userId
      );
      //   console.log("started");
    }
    // start/stop the typing timeout
    clearTimeout(typingDetectionTimeout);
    typingDetectionTimeout = setTimeout(() => {
      // stopped typing
      discussionStore.typingStop(
        $boardStore.boardId,
        $discussionStore.discussionId,
        $boardStore.userId
      );
      //   console.log("stopped");
      typingDetectionTimeout = null;
    }, 800);
  };
</script>

<div>
  <UnitEditor
    {onSubmit}
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
  <div>
    {#if $discussionStore.typers.length > 0}
      <div>typing...</div>
    {/if}
  </div>
</div>
