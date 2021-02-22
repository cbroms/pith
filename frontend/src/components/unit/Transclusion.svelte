<script>
  import TruncateText from "./TruncateText.svelte";

  export let transclusion;
  //   export let author;
  //   export let time;

  export let truncate = false;

  let open = false;
</script>

<div on:click={() => (open = !open)} class="transclusion">
  <TruncateText active={truncate && !open}>
    {transclusion}
    <!-- {#if open}
      <div>({author} {time})</div>
    {/if} -->
  </TruncateText>
</div>

<style>
  .transclusion {
    font-size: 12px;
    cursor: pointer;
  }
</style>
