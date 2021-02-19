<script>
  export let active = false;
</script>

<div class:truncate={active}>
  <slot />
</div>

<style>
  .truncate {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
