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
  <div class="discussion-page-board">
    <slot name="board" />
  </div>
</div>

<style>
  .discussion-page-layout {
    display: grid;
    grid-template-columns: 30vw 30vw 40vw;
    grid-template-rows: 30vh 70vh;
  }

  .discussion-page-chat {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }

  .discussion-page-pinned {
    grid-column: 2 / 3;
    grid-row: 1 / 3;
  }

  .discussion-page-focus {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
  }

  .discussion-page-board {
    grid-column: 3 / 4;
    grid-row: 2 / 3;
  }
</style>
