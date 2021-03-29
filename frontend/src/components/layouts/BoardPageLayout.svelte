<div class="board-page-layout">
  <div class="board-page-info">
    <slot name="info" />
  </div>
  <div class="board-page-board">
    <slot name="board" />
  </div>
</div>

<style>
  .board-page-layout {
    display: grid;
    grid-template-columns: 30vw 70vw;
    grid-template-rows: 100vh;
  }

  .board-page-info {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  .board-page-board {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }
</style>
