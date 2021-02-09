<script>
  import TopBanner from "./TopBanner.svelte";
  import { discussionSocket, boardSocket } from "../../stores/socket";

  let active = true;

  setTimeout(() => {
    active = false;
  }, 3200);
</script>

{#if ($discussionSocket === null || $boardSocket === null) && active}
  <TopBanner message="You are offline. Connecting to server..." />
{:else if (!$discussionSocket.connected || !$boardSocket.connected) && active}
  <TopBanner message="You are offline. Reconnecting to server..." />
{/if}
