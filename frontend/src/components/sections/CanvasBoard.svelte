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
  let offsetX = 0;
  let offsetY = 0;
  let scale = 1;

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
    offsetX = e.detail.x;
    offsetY = e.detail.y;
  };

  const handleScaleChange = (e) => {
    scale = e.detail.scale;
  };

  const handleCreateUnit = async () => {
    const newId = await boardStore.addUnit(
      $boardStore.boardId,
      "",
      (offsetX + bounds.width / 2) / scale,
      (offsetY + bounds.height / 2) / scale
    );
    boardDisplayContextStore.update((s) => {
      return { ...s, focused: newId };
    });
    console.log("added unit");
  };

  const setBounds = () => {
    panzoomInstance.zoomTo(0, 0, 1); // upper-left corner
    panzoomInstance.showRectangle({
      top: 0,
      bottom: 2000,
      left: 0,
      right: 2000,
    });
  };

  const zoomIn = () => {
    // unit space
    const centerX = (offsetX + bounds.width / 2) / scale;
    const centerY = (offsetY + bounds.height / 2) / scale;
    const dX = bounds.width / 2 / scale;
    const dY = bounds.height / 2 / scale;
    const top = centerY - dY * 0.8;
    const bottom = centerY + dY * 0.8;
    const left = centerX - dX * 0.8;
    const right = centerX + dX * 0.8;
    // HACK: to cancel animation
    panzoomInstance.zoomTo(centerX, centerY, 1.25); // upper-left corner
    // relative to original
    panzoomInstance.showRectangle({
      top: top,
      bottom: bottom,
      left: left,
      right: right,
    });
  };

  const zoomOut = () => {
    // unit space
    const centerX = (offsetX + bounds.width / 2) / scale;
    const centerY = (offsetY + bounds.height / 2) / scale;
    const dX = bounds.width / 2 / scale;
    const dY = bounds.height / 2 / scale;
    const top = centerY - dY * 1.25;
    const bottom = centerY + dY * 1.25;
    const left = centerX - dX * 1.25;
    const right = centerX + dX * 1.25;
    // HACK: to cancel animation
    panzoomInstance.zoomTo(centerX, centerY, 0.8); // upper-left corner
    // relative to original
    panzoomInstance.showRectangle({
      top: top,
      bottom: bottom,
      left: left,
      right: right,
    });
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
      on:scalechange={handleScaleChange}
      bind:panzoomInstance
      x={2000}
      y={2000}
    >
      <div class="board-controls" slot="controls">
        <button on:click={handleCreateUnit}>Create new unit</button>

        <div>
          <button on:click={setBounds}>Show Full board</button>
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
