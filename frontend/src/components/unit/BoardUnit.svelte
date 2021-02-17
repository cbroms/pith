<script>
  import { parseTime } from "../../utils/parseTime";
  import { boardStore } from "../../stores/boardStore";
  import { discussionStore } from "../../stores/discussionStore";

  export let unit;
  export let focus = false;
  export let edit = false;
  export let unfocus = false;
  export let links = false;
  export let discussions = false;
  export let newDiscussion = false;
  export let addLinkSource = false;
  export let addLinkTarget = false;
  export let onAddLinkSource; // function from parent
  export let onAddLinkTarget;
  export let onDiscussions;

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
  const onLinks = () => {
    linksOpen = !linksOpen;

    if (linksOpen) {
      boardStore.getUnitFull($boardStore.boardId, unit.id);
    }
  };

  const onNewDiscussion = () => {
    boardStore.createDiscussion($boardStore.boardId, unit.id);
    // console.log("new discussion");
  };

  // TODO make more efficient
  const onGetPith = (id) => {
    const temp_units = $boardStore.units.filter((e) => {
      return e.id === id;
    });
    return temp_units[0].pith;
  };

  const onUnitDiscussions = async () => {
    await boardStore.getUnitFull($boardStore.boardId, unit.id);
    onDiscussions(unit);
  };
</script>

<div class="board-unit">
  <div class="unit-content">{unit?.pith || ""}</div>
  {#if focus || unfocus || edit || links || newDiscussion || addLinkSource || addLinkTarget}
    <div class="unit-controls">
      <span class="controls-left">
        {#if links}
          <button on:click={onLinks}>Links</button>
        {/if}
        {#if discussions}
          <button on:click={onUnitDiscussions}>Discussions</button>
        {/if}
      </span>
      <span class="controls-right">
        {#if addLinkSource}
          <button on:click={() => onAddLinkSource(unit.id)}>Add Link</button>
        {:else if addLinkTarget}
          <button on:click={() => onAddLinkTarget(unit.id)}>Finish Link</button>
        {/if}
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
      <div class="links">
        <div class="links-header">Links To</div>
        {#if !unit.links_to}
          <div>Loading...</div>
        {:else if unit.links_to.length == 0}
          <div>No links where this unit is the source yet.</div>
        {:else}
          {#each unit.links_to as link (link.id)}
            <div>{link.target}: <i>{onGetPith(link.target)}</i></div>
          {/each}
        {/if}
      </div>
      <div class="links">
        <div class="links-header">Links From</div>
        {#if !unit.links_from}
          <div>Loading...</div>
        {:else if unit.links_from.length == 0}
          <div>No links where this unit is the target yet.</div>
        {:else}
          {#each unit.links_from as link (link.id)}
            <div>{link.source}: <i>{onGetPith(link.source)}</i></div>
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

  .links {
    padding: 10px;
  }

  .links-header {
    font-weight: bold;
  }
</style>
