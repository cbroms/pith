<script>
  import { onMount, afterUpdate } from "svelte";
  import { stores } from "@sapper/app";
  import { boardSocket as socket } from "../../stores/socket.js";

  const { session } = stores();
  const { BACKEND_HOST, BACKEND_PORT } = $session;

  // initialize board socket
  onMount(async () => {
    console.log("mount");
    socket.initialize(BACKEND_HOST, BACKEND_PORT, "board");
  });

  afterUpdate(() => {
    console.log("update");
  });
</script>

<slot />
