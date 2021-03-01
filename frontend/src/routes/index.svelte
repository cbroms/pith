<script>
  import BoardWindowLayout from "../components/layouts/BoardWindowLayout.svelte";
  import DiscussionLayout from "../components/layouts/DiscussionLayout.svelte";
  import { boardStore } from "../stores/globalStore";

  const onNewBoard = () => {
    globalStore.create();
  };
</script>

<svelte:head>
  <title>Pith</title>
</svelte:head>

<BoardWindowLayout>
  <DiscussionLayout>
    <div>
      <h1>Welcome to Pith v0.1.x</h1>
      <h2>Documentation</h2>
      <p>
        Find <a href="https://github.com/rainflame/pith#readme"
          >the documentation on our GitHub</a
        >.
      </p>
      <h2>Create a board</h2>
      <button class="button-inline" on:click={onNewBoard}>Create new board</button>
      <!--- Show created boards here...> 
      <br>
      <p>Navigate to the board with the ID in your browser:</p>
      <p><code>http://localhost:3000/b/5yo96fq8xr1m</code></p>
    </div>
  </DiscussionLayout>
</BoardWindowLayout>

<style>
  div {
    padding: 10px;
  }
</style>
