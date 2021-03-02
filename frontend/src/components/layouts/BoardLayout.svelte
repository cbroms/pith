<script>
  import { boardStore } from "../../stores/boardStore";

  const onSearch = () => {
    const query = "cat dog sydney";
    boardStore.search(
      $boardStore.boardId,
      query
    );  
  }
</script>

<div class="layout board-layout">
  <div class="layout-header">
    <h2>Board</h2>
    <button class="button-inline" on:click={onSearch}>Search</button>
    <button
      class="button-inline"
      on:click={() =>
        boardStore.updateBoard($boardStore.boardId, $boardStore.userId)}
      >Refresh Board</button
    >
  </div>
  <div class="layout-overflow">
    <slot />
  </div>
</div>

<style>
  .board-layout {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }

  .layout-header {
    display: flex;
    justify-content: space-between;
  }
</style>
