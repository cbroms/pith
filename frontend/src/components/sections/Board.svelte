<script>
  import { boardStore } from "../../stores/boardStore";

  import BoardUnit from "../unit/BoardUnit.svelte";

  export let id;
  export let focus = false;
  export let newDiscussion = false;

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
</script>

<div>
  {#if $boardStore.units.length === 0}
    <p>No units yet!</p>
  {/if}
  {#each $boardStore.units as unit (unit.id)}
    <BoardUnit {unit} {focus} {newDiscussion} edit links />
  {/each}
  <input
    placeholder="type a unit..."
    bind:value={content}
    on:keydown={onKeydown}
  />
</div>
