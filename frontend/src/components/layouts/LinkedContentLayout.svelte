<script>
  export let top = false;
</script>

<div class="message-transclusions" class:top>
  <slot />
</div>

<style>
  .message-transclusions {
    background: linear-gradient(#000, #000);
    background-size: 1px calc(100% - 10px);
    background-position: bottom left;
    background-repeat: no-repeat;
  }

  .top {
    background-size: 1px calc(100% - 10px);
    background-position: top left;
  }
</style>
