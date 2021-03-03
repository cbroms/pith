<script>
  export let id;

  let displayMessage = false;

  const onIdClick = async () => {
    try {
      await navigator.clipboard.writeText(`[[${id}]]`);
      displayMessage = true;
      setTimeout(() => {
        displayMessage = false;
      }, 3000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      console.error(
        "See https://github.com/rainflame/pith/issues/43#issuecomment-790097727 for more information."
      );
    }
  };
</script>

{#if displayMessage}
  <div class="copied-message">Copied!</div>
{:else}
  <button on:click={onIdClick}>#</button>
{/if}

<style>
  .copied-message {
    display: inline-block;
    font-size: 12px;
    padding: 0 10px;
  }
</style>
