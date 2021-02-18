<script>
  export let onLeave;
</script>

<div class="layout chat-layout">
  <div class="layout-header">
    <h2>Discussion</h2>
    <button on:click={onLeave}>Leave</button>
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
</style>
