<script>
  import BoardWindowLayout from "../components/layouts/BoardWindowLayout.svelte";
  import DiscussionLayout from "../components/layouts/DiscussionLayout.svelte";
  import { globalStore } from "../stores/globalStore";

  const onNewBoard = () => {
    console.log("onNewBoard");
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
      {#each $globalStore.boards as board (board)} 
        <div><a href="/b/{board}">{board}</a></div>
      {/each}
    </div>
  </DiscussionLayout>
</BoardWindowLayout>

<style>
  div {
    padding: 10px;
  }
</style>
