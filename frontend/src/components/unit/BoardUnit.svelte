<script>
  import { boardStore } from "../../stores/boardStore";
  import { discussionStore } from "../../stores/discussionStore";
  import { boardDisplayContextStore } from "../../stores/boardDisplayContextStore";

  import LinkedContentLayout from "../layouts/LinkedContentLayout.svelte";
  import LinkedContentItemLayout from "../layouts/LinkedContentItemLayout.svelte";

  import CopyContent from "../buttons/CopyContent.svelte";
  import TruncateText from "./TruncateText.svelte";
  import Transclusion from "./Transclusion.svelte";
  import BoardUnitEditor from "./BoardUnitEditor.svelte";

  export let unit;
  export let focus = false;
  export let edit = true;
  export let remove = true;
  export let unfocus = true;
  export let links = false;
  export let truncate = false;

  export let isCanvasElement = false;

  export let noControls = false;

  export let addLinkSource = false;
  export let addLinkTarget = false;
  export let onAddLinkSource;
  export let onAddLinkTarget;
  export let onClick = async () => {
    if (!editing) {
      linksOpen = !linksOpen;

      if (linksOpen) {
        await boardStore.getUnitFull($boardStore.boardId, unit.id);
      }
      // set the display context so we can render board info on the board
      boardDisplayContextStore.set({ id: unit.id });
    }
  };

  let linksOpen = false;
  let editing = false;

  let content = "";

  const onSubmit = (content) => {
    if (content !== "") {
      boardStore.editUnit($boardStore.boardId, unit.id, content);
      editing = false;
      if ($boardDisplayContextStore.focused === unit.id) {
        boardDisplayContextStore.update((s) => {
          return { ...s, focused: null };
        });
      }
    }
  };

  const onEdit = () => {
    editing = !editing;
    content = unit.pith;
  };

  const onRemove = () => {
    boardStore.removeUnit($boardStore.boardId, unit.id);
    boardDisplayContextStore.set({ id: null });
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

  const onRemoveLink = (linkId) => {
    boardStore.removeLink($boardStore.boardId, linkId);
  };

  $: {
    if (unit) {
      editing = $boardDisplayContextStore.focused === unit.id;
    }
  }
</script>

<div class="board-unit" class:no-spacing={isCanvasElement}>
  <div
    class="unit-content"
    class:no-spacing={isCanvasElement}
    on:click={onClick}
  >
    {#if editing}
      <BoardUnitEditor {content} {onSubmit} onCancel={onEdit} noBorder />
    {:else}
      <div class="text">
        <TruncateText active={truncate && !linksOpen}>{unit?.pith}</TruncateText
        >
      </div>
    {/if}
  </div>
  {#if !noControls && (focus || unfocus || edit || links || addLinkSource || addLinkTarget)}
    <div class="unit-controls">
      <span class="controls-left">
        <CopyContent id={unit?.id} />
      </span>
      <span class="controls-right">
        {#if addLinkSource}
          <button on:click={() => onAddLinkSource(unit.id)}>Add Link</button>
        {:else if addLinkTarget}
          <button on:click={() => onAddLinkTarget(unit.id)}
            >+ Finish Link</button
          >
        {/if}
        {#if focus}
          <button on:click={onFocus}>Focus</button>
        {:else if unfocus}
          <button on:click={onUnfocus}>Unfocus</button>
        {/if}
        {#if edit}
          <button on:click={onEdit}>{editing ? "Cancel edit" : "Edit"}</button>
        {/if}
        {#if remove}
          <button on:click={onRemove}>Remove</button>
        {/if}
      </span>
    </div>
    {#if linksOpen && (unit.links_to.length > 0 || unit.links_from.length > 0)}
      <div class="links">
        {#if !unit.links_to}
          <div>Loading...</div>
        {:else if unit.links_to.length > 0}
          <div class="links-header">Links</div>
          <LinkedContentLayout top>
            {#each unit.links_to as link (link.id)}
              <LinkedContentItemLayout>
                <div class="link-text">
                  <Transclusion
                    transclusion={$boardStore.units[link.target]?.pith}
                  />
                  <button
                    class="button-inline solid-width"
                    on:click={() => onRemoveLink(link.id)}>Remove link</button
                  >
                </div>
              </LinkedContentItemLayout>
            {/each}
          </LinkedContentLayout>
        {/if}
      </div>
      {#if unit.links_from && unit.links_from.length > 0}
        <div class="links">
          <div class="links-header">Backlinks</div>
          <LinkedContentLayout top>
            {#each unit.links_from as link (link.id)}
              <LinkedContentItemLayout>
                <div class="link-text">
                  <Transclusion
                    transclusion={$boardStore.units[link.source].pith}
                  />
                  <button
                    class="button-inline solid-width"
                    on:click={() => onRemoveLink(link.id)}
                    >Remove backlink</button
                  >
                </div>
              </LinkedContentItemLayout>
            {/each}
          </LinkedContentLayout>
        </div>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .board-unit {
    border: 1px solid black;
    margin: 10px 0;
  }

  .no-spacing {
    margin: 0;
    padding: 0;
    border: 0;
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

  .text {
    padding-bottom: 5px;
  }

  .solid-width {
    text-align: right;
    min-width: 90px;
  }

  .link-text {
    display: flex;
    justify-content: space-between;
  }
</style>
