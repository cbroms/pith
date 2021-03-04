<script>
  import { boardStore } from "../../stores/boardStore";
  import { discussionStore } from "../../stores/discussionStore";

  import ChatUnit from "./ChatUnit.svelte";
  import UnitEditor from "../inputs/UnitEditor.svelte";

  export let onSubmit = () => {};
  export let onCancel = () => {};
  export let noBorder = false;

  const onSearch = (query) => {
    discussionStore.search(
      $boardStore.boardId,
      $discussionStore.discussionId,
      query
    );
  };
</script>

<UnitEditor
  {onSubmit}
  {onCancel}
  {noBorder}
  {onSearch}
  noResults={$discussionStore.searchResults.length === 0}
  placeholder="type a message..."
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
