<div class="board-window-layout">
  <slot />
</div>

<style>
  .board-window-layout {
    min-height: 100%;
    display: grid;
    grid-template-columns: 60vw 40vw;
    grid-template-rows: 100vh;
  }
</style>
