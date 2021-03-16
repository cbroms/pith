<script>
  import { onMount } from "svelte";
  import CanvasBoardUnit from "../unit/CanvasBoardUnit.svelte";

  let Canvas;

  onMount(async () => {
    const module = await import("svelte-infinite-canvas");
    Canvas = module.default;
  });

  let data = [
    {
      id: "one",
      x: 20,
      y: 150,
      text:
        "<h1>This is a zoomable and pannable canvas which holds movable and linkable elements.</h1>",
      links: ["two", "four"],
    },
    {
      id: "two",
      x: 400,
      y: 20,
      text:
        "These elements can link together. Form new links by clicking on the box to the right of this text and selecting an element to link to.",
      links: [],
    },
    {
      id: "three",
      x: 700,
      y: 200,
      text:
        "You can render <em>any</em> html you want, like <code>code</code> or <strong>big, bold text</strong> ",
      links: [],
    },
    {
      id: "four",
      x: 470,
      y: 300,
      text: "It's very extensible",
      links: ["three", "five"],
    },
    {
      id: "five",
      x: 700,
      y: 370,
      props: {
        description:
          "you can even render your own components and pass in props",
        placeholder: "like this prop!",
      },
      links: [],
    },
  ];
</script>

{#if Canvas}
  <Canvas {data} OuterComponent={CanvasBoardUnit} />
{/if}

<!--    on:linkstart={handleLinkStart}
      on:linkend={handleLinkEnd}
      on:dragstart={handleDragStart}
      on:dragend={handleDragEnd} -->
