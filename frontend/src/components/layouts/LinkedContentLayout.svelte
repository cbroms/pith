<script>
  export let top = false;
</script>

<div class="linked-line-wrapper" class:top>
  <slot />
</div>

<style>
  .linked-line-wrapper {
    background: linear-gradient(#000, #000);
    background-size: 1px calc(100% - 9px);
    background-position: bottom left;
    background-repeat: no-repeat;
    padding-bottom: 5px;
  }

  .top {
    background-size: 1px calc(100% - 10px);
    background-position: top left;
    padding-bottom: 0;
  }
</style>
