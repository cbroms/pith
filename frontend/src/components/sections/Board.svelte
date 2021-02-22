<script>
  import { unix } from "dayjs";
  import { boardStore } from "../../stores/boardStore";

  import BoardUnit from "../unit/BoardUnit.svelte";

  export let id;
  export let focus = false;
  export let newDiscussion = false;
  export let noControls = false;

  let linkSourceId = null;
  let linkTargetId = null;

  let content = "";

  const onSubmit = () => {
    if (content !== "") {
      boardStore.addUnit(id, content);
      content = "";
    }
  };

  const onKeydown = (e) => {
    if (e.key === "Enter") onSubmit();
  };

  const onAddLinkSource = (id) => {
    linkSourceId = id;
  };

  const onAddLinkTarget = (id) => {
    linkTargetId = id;
    boardStore.addLink($boardStore.boardId, linkSourceId, linkTargetId);
    // reset
    linkSourceId = null;
    linkTargetId = null;
  };
</script>

<div>
  {#if $boardStore.units.length === 0}
    <p>No units yet!</p>
  {/if}
  {#each $boardStore.unitIds as unitId}
    <BoardUnit
      unit={$boardStore.units[unitId]}
      {focus}
      {newDiscussion}
      {noControls}
      edit
      remove
      links
      discussions
      {onAddLinkSource}
      {onAddLinkTarget}
      addLinkSource={(!linkSourceId && !linkTargetId) ||
        (linkSourceId && unitId === linkSourceId)}
      addLinkTarget={linkSourceId && unitId !== linkSourceId}
    />
  {/each}
  {#if !noControls}
    <input
      placeholder="type a pith..."
      bind:value={content}
      on:keydown={onKeydown}
    />
  {/if}
</div>
