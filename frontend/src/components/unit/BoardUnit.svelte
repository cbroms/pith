<script>
  import { parseTime } from "../../utils/parseTime";
  import { boardStore } from "../../stores/boardStore";
  import { discussionStore } from "../../stores/discussionStore";

  export let unit;
  export let focus = false;
  export let edit = false;
  export let unfocus = false;
  export let links = false;
  export let newDiscussion = false;

  let linksOpen = false;

  const onEdit = () => {
    console.log("on edit");
  };
  const onFocus = () => {
    discussionStore.addFocused(
      $boardStore.boardId,
      $discussionStore.discussionId,
      unit.id
    );
  };
  const onUnfocus = () => {
    discussionStore.removeFocused(
      $boardStore.boardId,
      $discussionStore.discussionId,
      unit.id
    );
  };
  const onLinks = async () => {
    linksOpen = !linksOpen;

    if (linksOpen) {
      boardStore.getUnitFull($boardStore.boardId, unit.id);
    }
  };

  const onNewDiscussion = () => {
    boardStore.createDiscussion($boardStore.boardId, unit.id);
    // console.log("new discussion");
  };
</script>

<div class="board-unit">
  <div class="unit-content">{unit?.pith || ""}</div>
  {#if focus || unfocus || edit || links || newDiscussion}
    <div class="unit-controls">
      <span class="controls-left">
        {#if links}
          <button on:click={onLinks}>Links</button>
        {/if}
      </span>
      <span class="controls-right">
        {#if newDiscussion}
          <button on:click={onNewDiscussion}>New Discussion</button>
        {/if}
        {#if focus}
          <button on:click={onFocus}>Focus</button>
        {:else if unfocus}
          <button on:click={onUnfocus}>Unfocus</button>
        {/if}
        {#if edit}
          <button on:click={onEdit}>Edit</button>
        {/if}
      </span>
    </div>
    {#if linksOpen}
      <div>
        {#if !unit.discussions}
          <p>Loading...</p>
        {:else if unit.discussions.length === 0}
          <p>No discussions yet!</p>
        {:else}
          {#each unit.discussions as discussion}
            <p>
              <a href="/b/{$boardStore.boardId}/d/{discussion.id}"
                >{parseTime(discussion.created)}</a
              >
            </p>
          {/each}
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .board-unit {
    border: 1px solid black;
    margin: 10px 0;
  }

  .unit-content {
    padding: 10px;
  }

  .unit-controls {
    display: flex;
    justify-content: space-between;
  }
</style>
