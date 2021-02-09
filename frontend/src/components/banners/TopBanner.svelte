<script>
  import { slide } from "svelte/transition";

  export let message = "";
</script>

<div class="alert-banner" transition:slide>
  <div class="alert-message">{message}</div>
</div>

<style>
  .alert-banner {
    padding: 10px;
    background-color: indianred;
    height: 50px;
  }
</style>
