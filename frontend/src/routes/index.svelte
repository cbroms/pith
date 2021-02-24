<script>
  import BoardWindowLayout from "../components/layouts/BoardWindowLayout.svelte";
  import DiscussionLayout from "../components/layouts/DiscussionLayout.svelte";
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
      <p>To get started, create a board by running:</p>
      <p><code>python3 make_fake.py</code></p>
      <p>which will give you an ID like <code>5yo96fq8xr1m</code>.</p>
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
