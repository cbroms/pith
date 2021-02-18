<script>
  import { parseTime } from "../../utils/parseTime";
  import { boardStore } from "../../stores/boardStore";
  import { discussionStore } from "../../stores/discussionStore";

  import LinkedContentLayout from "../layouts/LinkedContentLayout.svelte";
  import LinkedContentItemLayout from "../layouts/LinkedContentItemLayout.svelte";

  export let unit;
  export let focus = false;
  export let edit = false;
  export let remove = false;
  export let unfocus = false;
  export let links = false;
  export let newDiscussion = false;
  export let addLinkSource = false;
  export let addLinkTarget = false;
  export let onAddLinkSource; // function from parent
  export let onAddLinkTarget;
  export let onDiscussions;

  let linksOpen = false;
  let editing = false;

  let content = "";

  const onSubmit = () => {
    if (content !== "") {
      boardStore.editUnit($boardStore.boardId, unit.id, content);
      content = "";
      editing = false;
    }
  };

  const onKeydown = (e) => {
    if (e.key === "Enter") onSubmit();
  };

  const onEdit = () => {
    console.log("on edit");
    editing = true;
    content = unit.pith;
  };
  const onRemove = () => {
    boardStore.removeUnit($boardStore.boardId, unit.id);
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
      await boardStore.getUnitFull($boardStore.boardId, unit.id);

      if (onDiscussions) {
        onDiscussions(unit.id);
      }
    }
  };

  const onNewDiscussion = () => {
    boardStore.createDiscussion($boardStore.boardId, unit.id);
    // console.log("new discussion");
  };

  // TODO make more efficient
  const onGetPith = (id) => {
    return $boardStore.units[id].pith;
  };

  //   const onUnitDiscussions = async () => {
  //     await boardStore.getUnitFull($boardStore.boardId, unit.id);
  //     onDiscussions(unit);
  //   };

  //   const onUnitClick = () =>  {
  //     if (addLinkSource)
  //   }

  const onRemoveLink = (linkId) => {
    boardStore.removeLink($boardStore.boardId, linkId);
  };
</script>

<div class="board-unit">
  <div class="unit-content" on:click={onLinks}>
    {#if editing}
      <input
        placeholder="type a pith..."
        bind:value={content}
        on:keydown={onKeydown}
      />
    {:else}
      {unit.pith}
    {/if}
  </div>
  {#if focus || unfocus || edit || links || newDiscussion || addLinkSource || addLinkTarget}
    <div class="unit-controls">
      <span class="controls-left" />
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
        {#if remove}
          <button on:click={onRemove}>Remove</button>
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
          <LinkedContentLayout top>
            {#each unit.links_to as link (link.id)}
              <LinkedContentItemLayout>
                <div class="link-text">
                  {onGetPith(link.target)}
                  <button on:click={() => onRemoveLink(link.id)}>X</button>
                </div>
              </LinkedContentItemLayout>
            {/each}
          </LinkedContentLayout>
        {/if}
      </div>
      <div class="links">
        <div class="links-header">Links From</div>
        {#if !unit.links_from}
          <div>Loading...</div>
        {:else if unit.links_from.length == 0}
          <div>No links where this unit is the target yet.</div>
        {:else}
          <LinkedContentLayout top>
            {#each unit.links_from as link (link.id)}
              <LinkedContentItemLayout>
                <div class="link-text">
                  {onGetPith(link.source)}
                  <button on:click={() => onRemoveLink(link.id)}>X</button>
                </div>
              </LinkedContentItemLayout>
            {/each}
          </LinkedContentLayout>
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

  .board-unit:hover {
    background-color: rgb(240, 240, 240);
  }

  .unit-content {
    cursor: pointer;
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

  .link-text {
    display: inline-block;
  }
</style>
