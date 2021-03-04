<script>
  import { unix } from "dayjs";
  import { boardStore } from "../../stores/boardStore";
  import UnitEditor from "../inputs/UnitEditor.svelte";

  import BoardUnit from "../unit/BoardUnit.svelte";
  import BoardUnitEditor from "../unit/BoardUnitEditor.svelte";

  export let id;
  export let focus = false;
  export let newDiscussion = false;
  export let noControls = false;

  let linkSourceId = null;
  let linkTargetId = null;

  const onSubmit = (content) => {
    if (content !== "") {
      boardStore.addUnit(id, content);
    }
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
  <BoardUnitEditor {onSubmit} />
</div>
