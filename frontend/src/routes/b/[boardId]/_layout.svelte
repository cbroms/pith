<script>
  import ServerConnection from "../../../components/banners/ServerConnection.svelte";
  import ServerError from "../../../components/banners/ServerError.svelte";
</script>

<div class="wrapper">
  <div class="alert-wrapper">
    <ServerConnection />
    <ServerError />
  </div>

  <div class="content-wrapper">
    <slot />
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
  }

  .alert-wrapper {
    grid-row: 1 / 2;
  }

  .content-wrapper {
    grid-row: 2 / 3;
  }
</style>
