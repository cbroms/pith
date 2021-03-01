<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  import { boardSocket as socket } from "../../stores/socket.js";

  const { session } = stores();
  const { CONNECTION } = $session;

  // initialize global socket
  onMount(async () => {
    socket.initialize(CONNECTION, "");
  });
</script>

<main>
	<slot></slot>
</main>
