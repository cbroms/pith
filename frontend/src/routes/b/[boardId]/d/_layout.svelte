<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  import { discussionSocket as socket } from "../../../../stores/socket.js";

  const { session } = stores();
  const { CONNECTION } = $session;

  // initialize discussion
  onMount(async () => {
    socket.initialize(CONNECTION, "discussion");
  });
</script>

<slot />
