<script>
  import { onMount } from "svelte";
  import { boardStore } from "../../stores/boardStore";
  import CanvasBoardUnitOuter from "../unit/CanvasBoardUnitOuter.svelte";
  import BoardUnit from "../unit/BoardUnit.svelte";

  export let id;
  let data = [];

  let Canvas;

  onMount(async () => {
    // dynamic import; only load the library once the component is mounted
    const module = await import("svelte-infinite-canvas");
    Canvas = module.default;

    console.log($boardStore);
  });

  $: {
    const tempData = [];
    for (const id in $boardStore.units) {
      tempData.push({
        id,
        x: $boardStore.units[id].position.x,
        y: $boardStore.units[id].position.y,
        props: {
          isCanvasElement: true,
          unit: { ...$boardStore.units[id] },
        },
        links: [],
      });
    }

    data = [...tempData];

    console.log(data);
  }

  //   let data = [
  //     {
  //       id: "one",
  //       x: 20,
  //       y: 150,
  //       text:
  //         "<h1>This is a zoomable and pannable canvas which holds movable and linkable elements.</h1>",
  //       links: ["two", "four"],
  //     },
  //     {
  //       id: "two",
  //       x: 400,
  //       y: 20,
  //       text:
  //         "These elements can link together. Form new links by clicking on the box to the right of this text and selecting an element to link to.",
  //       links: [],
  //     },
  //     {
  //       id: "three",
  //       x: 700,
  //       y: 200,
  //       text:
  //         "You can render <em>any</em> html you want, like <code>code</code> or <strong>big, bold text</strong> ",
  //       links: [],
  //     },
  //     {
  //       id: "four",
  //       x: 470,
  //       y: 300,
  //       text: "It's very extensible",
  //       links: ["three", "five"],
  //     },
  //     {
  //       id: "five",
  //       x: 700,
  //       y: 370,
  //       props: {
  //         description:
  //           "you can even render your own components and pass in props",
  //         placeholder: "like this prop!",
  //       },
  //       links: [],
  //     },
  //   ];
</script>

{#if Canvas}
  <Canvas
    {data}
    OuterComponent={CanvasBoardUnitOuter}
    InnerComponent={BoardUnit}
    x={2000}
    y={2000}
  />
{/if}

<!--    on:linkstart={handleLinkStart}
      on:linkend={handleLinkEnd}
      on:dragstart={handleDragStart}
      on:dragend={handleDragEnd} -->
