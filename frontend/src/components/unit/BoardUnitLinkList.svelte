<script>
  import { slide } from "svelte/transition";

  import { boardStore } from "../../stores/boardStore";

  import LinkedContentLayout from "../layouts/LinkedContentLayout.svelte";
  import LinkedContentItemLayout from "../layouts/LinkedContentItemLayout.svelte";
  import Transclusion from "./Transclusion.svelte";

  export let links;
  export let title;
  export let key = "";
  export let onRemoveLink = () => {};
</script>

<div class="links" transition:slide>
  <div class="links-header">{title}</div>
  <LinkedContentLayout top>
    {#each links as link (link.id)}
      <LinkedContentItemLayout>
        <div class="link-text">
          <div class="text-wrapper">
            <Transclusion
              truncate
              transclusion={$boardStore.units[link[key]]?.pith}
            />
          </div>
          <button
            class="button-inline solid-width"
            on:click={() => onRemoveLink(link.id)}>Remove link</button
          >
        </div>
      </LinkedContentItemLayout>
    {/each}
  </LinkedContentLayout>
</div>

<style>
  .links {
    padding: 10px;
  }

  .solid-width {
    text-align: right;
    min-width: 90px;
  }

  .link-text {
    display: flex;
    justify-content: space-between;
  }

  .text-wrapper {
    width: calc(100% - 90px);
  }
</style>
