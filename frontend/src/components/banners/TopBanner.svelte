<script>
  import { slide } from "svelte/transition";

  export let message = "";
  export let error = false;
  export let info = true;
</script>

<div class="alert-banner" class:error class:info transition:slide>
  <div class="alert-message">{message}</div>
</div>

<style>
  .alert-banner {
    padding: 10px;
    height: 50px;
  }

  .info {
    background-color: rgb(113, 113, 255);
  }

  .error {
    background-color: rgb(255, 113, 113);
  }
</style>
