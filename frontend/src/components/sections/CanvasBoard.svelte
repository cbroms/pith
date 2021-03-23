<script>
  import { afterUpdate, onMount } from "svelte";
  import { boardStore } from "../../stores/boardStore";
  import { boardDisplayContextStore } from "../../stores/boardDisplayContextStore";
  import BoardUnitConnection from "../unit/BoardUnitConnection.svelte";
  import BoardUnitHandle from "../unit/BoardUnitHandle.svelte";
  import BoardUnit from "../unit/BoardUnit.svelte";

  let data = [];
  let Canvas;
  let areaElt = null;

  let bounds = { width: 0, height: 0 };
  let centerX;
  let centerY;

  onMount(async () => {
    // dynamic import; only load the library once the component is mounted
    const module = await import("svelte-infinite-canvas");
    Canvas = module.default;
  });

  afterUpdate(() => {
    if (areaElt) {
      console.log("updating");
      // TODO improve performance by only calling this when the area elt changes
      const eltBounds = areaElt.getBoundingClientRect();
      bounds = { width: eltBounds.width, height: eltBounds.height };
    }
  });

  $: {
    const tempData = [];
    for (const id in $boardStore.units) {
      tempData.push({
        id,
        x: $boardStore.units[id].position.x,
        y: $boardStore.units[id].position.y,
        props: {
          focus: true,
          isCanvasElement: true,
          unit: { ...$boardStore.units[id] },
        },
        links: $boardStore.units[id].links_to.map((link) => {
          return { id: link.target };
        }),
      });
    }
    data = [...tempData];
  }

  const handleDragEnd = async (e) => {
    await boardStore.moveUnit(
      $boardStore.boardId,
      e.detail.id,
      e.detail.x,
      e.detail.y
    );
  };

  const handleLinkEnd = (e) => {
    console.log(e.detail);
    boardStore.addLink($boardStore.boardId, e.detail.from, e.detail.to);
  };

  const handleOffsetChange = (e) => {
    centerX = e.detail.x + bounds.width / 2 - 100;
    centerY = e.detail.y + bounds.height / 2 - 100;
  };

  const handleCreateUnit = async () => {
    const newId = await boardStore.addUnit(
      $boardStore.boardId,
      "",
      centerX,
      centerY
    );
    boardDisplayContextStore.update((s) => {
      return { ...s, focused: newId };
    });
    console.log("added unit");
  };
</script>

{#if Canvas}
  <div class="board-wrapper" bind:this={areaElt}>
    <div class="board">
      <Canvas
        {data}
        OuterComponent={BoardUnitHandle}
        InnerComponent={BoardUnit}
        LineComponent={BoardUnitConnection}
        on:dragend={handleDragEnd}
        on:linkend={handleLinkEnd}
        on:offsetchange={handleOffsetChange}
        x={2000}
        y={2000}
      />
    </div>
    <div class="board-controls">
      <button class="button-inline" on:click={handleCreateUnit}
        >Create new unit</button
      >
      <div>
        <button on:click={handleCreateUnit}>+ Zoom in</button>
        <button class="button-inline" on:click={handleCreateUnit}
          >- Zoom out</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  .board-wrapper {
    height: 100%;
    width: 100%;
    overflow: hidden;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 1fr auto;
  }

  .board {
    overflow: scroll;
    grid-row: 1 / 2;
  }

  .board-controls {
    display: flex;
    justify-content: space-between;
    grid-row: 2 / 3;
  }
</style>
