<script>
  export let boardMaximized;
</script>

<div class="discussion-page-layout">
  <div class="discussion-page-chat">
    <slot name="chat" />
  </div>
  <div class="discussion-page-pinned">
    <slot name="pinned" />
  </div>
  <div class="discussion-page-focus">
    <slot name="focus" />
  </div>
  <div class="discussion-page-board" class:maximized={boardMaximized}>
    <slot name="board" />
  </div>
</div>

<style>
  .discussion-page-layout {
    display: grid;
    grid-template-columns: 50vw 50vw;
    grid-template-rows: calc(30vh - 46px) calc(70vh - 46px);
  }

  .discussion-page-chat {
    background-color: white;
    z-index: 1;
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }

  .discussion-page-pinned {
    z-index: 1;
    background-color: white;
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }

  .discussion-page-focus {
    z-index: 1;
    background-color: white;
    grid-column: 3 / 4;
    grid-row: 1 / 2;
  }

  .discussion-page-board {
    background-color: white;
    grid-column: 3 / 4;
    grid-row: 2 / 3;
  }

  .maximized {
    z-index: 2;
    grid-column: 2 / 4;
    grid-row: 1 / 3;
  }
</style>
