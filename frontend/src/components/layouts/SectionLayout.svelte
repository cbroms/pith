<script>
  export let sectionName = "";
</script>

<div class="layout">
  <div class="layout-header">
    <h2>{sectionName}</h2>
    <slot name="header" />
  </div>
  <div class="layout-overflow">
    <slot />
  </div>
</div>

<style>
  .layout {
    padding: 15px;
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
  }

  h2 {
    margin: 0;
    display: inline-block;
  }

  .layout-overflow {
    grid-row: 2/3;
    overflow-y: scroll;
  }

  .layout-header {
    padding-bottom: 10px;
    width: 100%;
    border-bottom: 1px solid;
    display: flex;
    /* justify-content: space-between; */
    align-items: baseline;
  }
</style>
