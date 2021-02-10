<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  import { boardSocket as socket } from "../../stores/socket.js";

  const { session } = stores();
  const { BACKEND_HOST, BACKEND_PORT } = $session;

  // initialize board socket
  onMount(async () => {
    socket.initialize(BACKEND_HOST, BACKEND_PORT, "board");
  });
</script>

<slot />
