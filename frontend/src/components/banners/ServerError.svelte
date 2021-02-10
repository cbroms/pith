<script>
  import TopBanner from "./TopBanner.svelte";

  import { boardStore } from "../../stores/boardStore";
</script>

{#if $boardStore.serverError}
  <TopBanner error message="Server error! Try again later." />
{/if}
