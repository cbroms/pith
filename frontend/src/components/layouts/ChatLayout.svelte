<script>
  export let numParticipants = 0;
  export let onLeave;
</script>

<div class="layout chat-layout">
  <div class="layout-header">
    <div>
      <h2 class="chat-title">Discussion</h2>
      <div class="chat-participants">{numParticipants} participants</div>
    </div>
    <button class="button-inline" on:click={onLeave}>Leave discussion</button>
  </div>
  <div class="layout-overflow">
    <slot />
  </div>
</div>

<style>
  .layout-header {
    display: flex;
    justify-content: space-between;
  }
  .chat-layout {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
  }
  .chat-title {
    display: inline-block;
  }
  .chat-participants {
    display: inline-block;
    margin-left: 10px;
  }
</style>
