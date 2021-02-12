<script>
  import { boardStore } from "../../stores/boardStore";

  import BoardUnit from "../unit/BoardUnit.svelte";

  export let id;

  console.log($boardStore);

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
  {#each $boardStore.units as unit (unit.id)}
    <BoardUnit {unit} focus edit links />
  {/each}
  <input
    placeholder="type a unit..."
    bind:value={content}
    on:keydown={onKeydown}
  />
</div>
