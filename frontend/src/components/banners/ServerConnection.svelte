<script>
  import TopBanner from "./TopBanner.svelte";
  import { boardSocket } from "../../stores/socket";
</script>

{#if $boardSocket === null}
  <TopBanner message="You are offline. Connecting to server..." />
{:else if !$boardSocket.connected}
  <TopBanner message="You are offline. Reconnecting to server..." />
{/if}
