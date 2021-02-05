<div class="layout board-layout">
    <div class="layout-header">
        <h2>Board</h2>
    </div>
    <div class="layout-overflow">
        <slot />
    </div>
</div>

<style>
    .board-layout {
        grid-column: 2 / 3;
        grid-row: 1 / 2;

        /* border-left: 1px solid; */
    }
</style>
