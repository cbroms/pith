<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  import { boardSocket as socket } from "../../stores/socket.js";

  const { session } = stores();
  const { CONNECTION } = $session;

  // initialize board socket
  onMount(async () => {
    socket.initialize(CONNECTION, "board");
  });
</script>

<slot />
