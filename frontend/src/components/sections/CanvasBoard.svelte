<script>
  import { afterUpdate, onMount } from "svelte";
  import { boardStore } from "../../stores/boardStore";
  import { boardDisplayContextStore } from "../../stores/boardDisplayContextStore";
  import BoardUnitConnection from "../unit/BoardUnitConnection.svelte";
  import BoardUnitHandle from "../unit/BoardUnitHandle.svelte";
  import BoardUnit from "../unit/BoardUnit.svelte";
  import { discussionStore } from "../../stores/discussionStore";

  let data = [];
  let Canvas;
  let areaElt = null;
  let panzoomInstance;

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
      // TODO improve performance by only calling this when the area elt changes
      const eltBounds = areaElt.getBoundingClientRect();
      console.log("updating", eltBounds.width, eltBounds.height);
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
          focus:
            ($discussionStore.discussionId &&
              !$discussionStore.focused.includes(id)) ||
            false,
          unfocus:
            ($discussionStore.discussionId &&
              $discussionStore.focused.includes(id)) ||
            false,
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
    boardStore.addLink(
      $boardStore.boardId,
      "link pith",
      e.detail.from,
      e.detail.to
    );
  };

  const handleOffsetChange = (e) => {
    centerX = e.detail.x + bounds.width / 2;
    centerY = e.detail.y + bounds.height / 2;
    console.log("offset", centerX, centerY);
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

  const zoomIn = () => {
    // bounding box in units, scale, center in units
    // bounding box in pixels (bounding box in units * scale)
    // center in pixels (center in units * scale)
    console.log("zoom in", centerX, centerY);
    panzoomInstance.smoothZoom(centerX, centerY, 1.1);
  };

  const zoomOut = () => {
    console.log("zoom out", centerX, centerY);
    panzoomInstance.smoothZoom(centerX, centerY, 0.9);
  };
</script>

{#if Canvas}
  <div class="board-wrapper" bind:this={areaElt}>
    <Canvas
      {data}
      OuterComponent={BoardUnitHandle}
      InnerComponent={BoardUnit}
      LineComponent={BoardUnitConnection}
      on:dragend={handleDragEnd}
      on:linkend={handleLinkEnd}
      on:offsetchange={handleOffsetChange}
      bind:panzoomInstance
      x={2000}
      y={2000}
    >
      <div class="board-controls" slot="controls">
        <button on:click={handleCreateUnit}>Create new unit</button>
        <div>
          <button on:click={zoomIn}>+ Zoom in</button>
          <button on:click={zoomOut}>- Zoom out</button>
        </div>
      </div>
    </Canvas>
  </div>
{/if}

<style>
  .board-wrapper {
    height: 100%;
    width: 100%;
    overflow: hidden;
    border: 1px solid;
    border-top: none;
  }

  .board-controls {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px;
    display: flex;
    justify-content: space-between;
  }
</style>
