<script>
  export let id;

  const onIdClick = async () => {
    try {
      await navigator.clipboard.writeText(id);
      alert(
        `Copied unit ID!\n\nReference it in a message using double brackets: [[ ${id} ]]`
      );
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };
</script>

<button on:click={onIdClick}>#</button>
