<script>
  import { afterUpdate } from "svelte";
  import { boardStore } from "../../stores/boardStore";
  import { discussionStore } from "../../stores/discussionStore";
  import { boardDisplayContextStore } from "../../stores/boardDisplayContextStore";

  import LinkedContentLayout from "../layouts/LinkedContentLayout.svelte";
  import LinkedContentItemLayout from "../layouts/LinkedContentItemLayout.svelte";
  import CopyContent from "../buttons/CopyContent.svelte";
  import TruncateText from "./TruncateText.svelte";
  import Transclusion from "./Transclusion.svelte";

  import BoardUnitEditor from "./BoardUnitEditor.svelte";
  import BoardUnitLinkList from "./BoardUnitLinkList.svelte";

  export let unit;
  export let focus = false;
  export let edit = true;
  export let remove = true;
  export let unfocus = false;
  export let links = false;
  export let truncate = false;

  export let isCanvasElement = false;

  export let noControls = false;

  export let addLinkSource = false;
  export let cancelLink;
  export let addLinkTarget = false;
  export let onAddLinkSource;
  export let onCancelLink;
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

  let pith = unit.pith || "";

  let content = "";

  let orderedTransclusions = [];

  const parseTransclusions = () => {
    if (unit.transclusions) {
      orderedTransclusions = unit.transclusions.list.map((e) => {
        return unit.transclusions.map[e];
      });
      pith = unit.transclusions.pith;
    }
  };

  afterUpdate(() => {
    parseTransclusions();
  });

  const onSubmit = (content) => {
    if (content !== "") {
      boardStore.editUnit($boardStore.boardId, unit.id, content);
      editing = false;
      if ($boardDisplayContextStore.focused === unit.id) {
        boardDisplayContextStore.set({ focused: null });
      }
    }
  };

  const onEdit = () => {
    editing = !editing;
    if (editing) {
      boardDisplayContextStore.set({ focused: unit.id });
    }
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
      editing = $boardDisplayContextStore.focused === unit.id && edit;
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
      {#if orderedTransclusions.length > 0}
        <LinkedContentLayout>
          {#each orderedTransclusions as transclusion}
            <LinkedContentItemLayout>
              <Transclusion {transclusion} truncate />
            </LinkedContentItemLayout>
          {/each}
        </LinkedContentLayout>
      {/if}
      <div class="text">
        <TruncateText active={truncate && !linksOpen}>{pith}</TruncateText>
      </div>
    {/if}
  </div>
  {#if linksOpen && (unit.links_to.length > 0 || unit.links_from.length > 0)}
    {#if unit.links_to.length > 0}
      <BoardUnitLinkList
        links={unit.links_to}
        {onRemoveLink}
        key="target"
        title="Links"
      />
    {/if}
    {#if unit.links_from.length > 0}
      <BoardUnitLinkList
        links={unit.links_from}
        {onRemoveLink}
        key="source"
        title="Backlinks"
      />
    {/if}
  {/if}

  {#if !noControls && (focus || unfocus || edit || links || addLinkSource || addLinkTarget)}
    <div class="unit-controls">
      <span class="controls-left">
        <CopyContent id={unit?.id} />
      </span>
      <span class="controls-right">
        {#if addLinkSource}
          <button on:click={() => onAddLinkSource(unit.id)}>Add Link</button>
        {:else if cancelLink}
          <button on:click={() => onCancelLink()}>Cancel Link</button>
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

  .text {
    padding-bottom: 5px;
  }
</style>
